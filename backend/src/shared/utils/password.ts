import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export class PasswordHasher {
  static hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  static compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
