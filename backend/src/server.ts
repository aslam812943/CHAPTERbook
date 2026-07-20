import { createApp } from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./infrastructure/database/connect";

async function main(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`[server] listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});
