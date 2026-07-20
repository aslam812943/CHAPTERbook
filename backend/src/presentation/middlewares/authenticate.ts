import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../../shared/errors/AppError";
import { JwtPayload, TokenService } from "../../shared/utils/jwt";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid Authorization header");
  }

  const token = header.slice("Bearer ".length);
  try {
    req.user = TokenService.verifyAccessToken(token);
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }

  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role !== "admin") {
    throw new ForbiddenError("Admin access required");
  }
  next();
}
