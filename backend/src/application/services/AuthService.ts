import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { Address, User, UserRole } from "../../domain/entities/User";
import { PasswordHasher } from "../../shared/utils/password";
import { JwtPayload, TokenService } from "../../shared/utils/jwt";
import { sendPasswordResetEmail } from "../../shared/utils/mailer";
import { verifyGoogleIdToken } from "../../shared/utils/googleAuth";
import { ConflictError, UnauthorizedError, ValidationError } from "../../shared/errors/AppError";

const RESET_CODE_TTL_MS = 15 * 60 * 1000;

function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  addresses: Address[];
}

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    addresses: user.addresses,
  };
}

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async register(name: string, email: string, password: string): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await PasswordHasher.hash(password);
    const user = await this.userRepository.create({ name, email, passwordHash, role: "customer" });

    return { user: toSafeUser(user), tokens: this.issueTokens(user) };
  }

  async login(email: string, password: string): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      // No account, or a Google-only account with no password to check
      // against - same generic message either way so this can't be used
      // to probe which emails exist or how they signed up.
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await PasswordHasher.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    return { user: toSafeUser(user), tokens: this.issueTokens(user) };
  }

  async loginWithGoogle(idToken: string): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    const profile = await verifyGoogleIdToken(idToken);
    if (!profile.emailVerified) {
      throw new UnauthorizedError("Google account email is not verified");
    }

    let user = await this.userRepository.findByGoogleId(profile.googleId);

    if (!user) {
      const existingByEmail = await this.userRepository.findByEmail(profile.email);
      if (existingByEmail) {
        // Same email already has a password-based account - link this
        // Google identity to it instead of creating a duplicate, so either
        // sign-in method works going forward.
        user = await this.userRepository.linkGoogleAccount(existingByEmail.id, profile.googleId);
      } else {
        user = await this.userRepository.create({
          name: profile.name,
          email: profile.email,
          authProvider: "google",
          googleId: profile.googleId,
          role: "customer",
        });
      }
    }

    if (!user) {
      throw new UnauthorizedError("Could not sign in with Google");
    }

    return { user: toSafeUser(user), tokens: this.issueTokens(user) };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = TokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    return this.issueTokens(user);
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError("Session is no longer valid");
    }
    return toSafeUser(user);
  }

  async addAddress(userId: string, address: Address): Promise<SafeUser> {
    const user = await this.userRepository.addAddress(userId, address);
    if (!user) {
      throw new UnauthorizedError("Session is no longer valid");
    }
    return toSafeUser(user);
  }

  async removeAddress(userId: string, addressIndex: number): Promise<SafeUser> {
    const user = await this.userRepository.removeAddress(userId, addressIndex);
    if (!user) {
      throw new UnauthorizedError("Session is no longer valid");
    }
    return toSafeUser(user);
  }

  async setDefaultAddress(userId: string, addressIndex: number): Promise<SafeUser> {
    const user = await this.userRepository.setDefaultAddress(userId, addressIndex);
    if (!user) {
      throw new UnauthorizedError("Session is no longer valid");
    }
    return toSafeUser(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError("Session is no longer valid");
    }
    if (!user.passwordHash) {
      throw new ValidationError("This account signed in with Google and has no password to change");
    }

    const valid = await PasswordHasher.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    const passwordHash = await PasswordHasher.hash(newPassword);
    await this.userRepository.updatePassword(user.id, passwordHash);
  }

  // Always resolves - a nonexistent email silently does nothing, so this
  // can't be used to probe which emails have accounts.
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return;

    const code = generateResetCode();
    const codeHash = await PasswordHasher.hash(code);
    const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MS);

    await this.userRepository.setResetCode(user.id, codeHash, expiresAt);
    await sendPasswordResetEmail(user.email, code);
  }

  async verifyPasswordResetCode(email: string, code: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.resetCodeHash || !user.resetCodeExpiresAt) {
      throw new UnauthorizedError("Invalid or expired code");
    }
    if (user.resetCodeExpiresAt.getTime() < Date.now()) {
      throw new UnauthorizedError("Invalid or expired code");
    }

    const valid = await PasswordHasher.compare(code, user.resetCodeHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid or expired code");
    }

    // Single-use: a code can't be replayed to mint a second reset token.
    await this.userRepository.clearResetCode(user.id);
    return TokenService.signResetToken({ sub: user.id, email: user.email });
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    let payload;
    try {
      payload = TokenService.verifyResetToken(resetToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired reset session - please request a new code");
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedError("Invalid or expired reset session - please request a new code");
    }

    // Rejects replaying the same reset token after it's already been used
    // once - the token itself doesn't otherwise know it was consumed since
    // it's a stateless JWT valid for its full 10-minute window.
    if (user.passwordChangedAt && user.passwordChangedAt.getTime() / 1000 > payload.iat) {
      throw new UnauthorizedError("Invalid or expired reset session - please request a new code");
    }

    const passwordHash = await PasswordHasher.hash(newPassword);
    await this.userRepository.updatePassword(user.id, passwordHash);
  }

  private issueTokens(user: User): AuthTokens {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: TokenService.signAccessToken(payload),
      refreshToken: TokenService.signRefreshToken(payload),
    };
  }
}
