import { env } from "../config/env";
import { connectDatabase, disconnectDatabase } from "../infrastructure/database/connect";
import { UserModel } from "../infrastructure/database/models/User.model";
import { PasswordHasher } from "../shared/utils/password";

async function seedAdmin(): Promise<void> {
  await connectDatabase();

  const existing = await UserModel.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      console.log(`[seed] promoted existing user ${existing.email} to admin`);
    } else {
      console.log(`[seed] admin ${existing.email} already exists, nothing to do`);
    }
  } else {
    const passwordHash = await PasswordHasher.hash(env.ADMIN_PASSWORD);
    const admin = await UserModel.create({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      passwordHash,
      role: "admin",
    });
    console.log(`[seed] created admin user ${admin.email}`);
  }

  await disconnectDatabase();
}

seedAdmin().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
