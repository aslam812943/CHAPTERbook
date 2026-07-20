import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { UserRole } from "../../domain/entities/User";

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface ResetTokenPayload {
  sub: string;
  email: string;
  purpose: "password-reset";
  // Present on any verified token (jsonwebtoken merges standard claims in) -
  // declared explicitly since callers need it to reject tokens issued
  // before the password was last changed.
  iat: number;
}

export class TokenService {
  static signAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  static signRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  }

  // Short-lived, single-purpose token proving a user just verified their
  // password-reset code - lets the final "set new password" step skip
  // re-sending the code, without reusing the access/refresh token secrets
  // for a fundamentally different kind of credential.
  static signResetToken(payload: Omit<ResetTokenPayload, "purpose" | "iat">): string {
    return jwt.sign({ ...payload, purpose: "password-reset" }, env.JWT_ACCESS_SECRET, {
      expiresIn: "10m",
    } as jwt.SignOptions);
  }

  static verifyResetToken(token: string): ResetTokenPayload {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as ResetTokenPayload;
    if (payload.purpose !== "password-reset") {
      throw new Error("Not a password reset token");
    }
    return payload;
  }
}
