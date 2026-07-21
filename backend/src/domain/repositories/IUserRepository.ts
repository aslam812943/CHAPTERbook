import { Address, CreateUserInput, User } from "../entities/User";

export interface IUserRepository {
  create(input: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  linkGoogleAccount(userId: string, googleId: string): Promise<User | null>;
  addAddress(userId: string, address: Address): Promise<User | null>;
  removeAddress(userId: string, addressIndex: number): Promise<User | null>;
  setResetCode(userId: string, codeHash: string, expiresAt: Date): Promise<void>;
  clearResetCode(userId: string): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
}
