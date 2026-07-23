import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { AppError } from "../../shared/errors/AppError";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Invalid request data",
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      details: err.details,
    });
    return;
  }

  // A malformed :id/:bookId/etc. route param (not a valid ObjectId) throws
  // this from Mongoose before any service code runs - treat it the same as
  // "not found" rather than letting it fall through to a 500, since it's
  // client input error, not a server fault.
  if (err instanceof mongoose.Error.CastError) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Internal server error" });
}
