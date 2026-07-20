import { Request, Response } from "express";
import { AuthService, AuthTokens } from "../../application/services/AuthService";
import { UnauthorizedError } from "../../shared/errors/AppError";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body;
    const { user, tokens } = await this.authService.register(name, email, password);
    this.respondWithSession(res, user, tokens, 201);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const { user, tokens } = await this.authService.login(email, password);
    this.respondWithSession(res, user, tokens, 200);
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedError("Missing refresh token");
    }
    const tokens = await this.authService.refresh(refreshToken);
    res.json({ tokens });
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const user = await this.authService.getProfile(req.user!.sub);
    res.json({ user });
  };

  addAddress = async (req: Request, res: Response): Promise<void> => {
    const user = await this.authService.addAddress(req.user!.sub, req.body);
    res.status(201).json({ user });
  };

  removeAddress = async (req: Request, res: Response): Promise<void> => {
    const index = Number(req.params.index);
    const user = await this.authService.removeAddress(req.user!.sub, index);
    res.json({ user });
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    await this.authService.requestPasswordReset(req.body.email);
    // Same response whether or not the email exists, so this can't be used
    // to check which addresses have accounts.
    res.json({ message: "If an account exists for that email, a reset code has been sent." });
  };

  verifyResetCode = async (req: Request, res: Response): Promise<void> => {
    const { email, code } = req.body;
    const resetToken = await this.authService.verifyPasswordResetCode(email, code);
    res.json({ resetToken });
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { resetToken, newPassword } = req.body;
    await this.authService.resetPassword(resetToken, newPassword);
    res.json({ message: "Password updated. You can now log in with your new password." });
  };

  private respondWithSession(
    res: Response,
    user: unknown,
    tokens: AuthTokens,
    status: number
  ): void {
    res.status(status).json({ user, tokens });
  }
}
