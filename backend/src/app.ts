import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./presentation/middlewares/errorHandler";
import { buildApiRouter } from "./container";

export function createApp(): Express {
  const app = express();

  // Render (and most PaaS hosts) sit the app behind a reverse proxy -
  // without this, express-rate-limit can't correctly read the real client
  // IP from X-Forwarded-For and throws in production. Harmless locally.
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", buildApiRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
