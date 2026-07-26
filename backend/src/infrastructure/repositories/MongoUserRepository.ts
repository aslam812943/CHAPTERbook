import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { Address, CreateUserInput, User } from "../../domain/entities/User";
import { AddressSubdocument, UserDocument, UserModel } from "../database/models/User.model";

function toDomain(doc: UserDocument): User {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    passwordHash: doc.passwordHash,
    role: doc.role,
    authProvider: doc.authProvider,
    googleId: doc.googleId,
    addresses: doc.addresses.map((a: AddressSubdocument) => ({
      fullName: a.fullName,
      phone: a.phone,
      addressLine: a.addressLine,
      city: a.city,
      postalCode: a.postalCode,
      country: a.country,
      isDefault: a.isDefault,
    })),
    resetCodeHash: doc.resetCodeHash,
    resetCodeExpiresAt: doc.resetCodeExpiresAt,
    passwordChangedAt: doc.passwordChangedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoUserRepository implements IUserRepository {
  async create(input: CreateUserInput): Promise<User> {
    const doc = await UserModel.create({
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      authProvider: input.authProvider ?? "local",
      googleId: input.googleId,
      role: input.role ?? "customer",
    });
    return toDomain(doc);
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? toDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() });
    return doc ? toDomain(doc) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const doc = await UserModel.findOne({ googleId });
    return doc ? toDomain(doc) : null;
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(userId, { googleId }, { new: true });
    return doc ? toDomain(doc) : null;
  }

  async addAddress(userId: string, address: Address): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(
      userId,
      { $push: { addresses: address } },
      { new: true }
    );
    return doc ? toDomain(doc) : null;
  }

  async removeAddress(userId: string, addressIndex: number): Promise<User | null> {
    const doc = await UserModel.findById(userId);
    if (!doc) return null;
    if (addressIndex < 0 || addressIndex >= doc.addresses.length) return toDomain(doc);
    doc.addresses.splice(addressIndex, 1);
    await doc.save();
    return toDomain(doc);
  }

  async setDefaultAddress(userId: string, addressIndex: number): Promise<User | null> {
    const doc = await UserModel.findById(userId);
    if (!doc) return null;
    if (addressIndex < 0 || addressIndex >= doc.addresses.length) return toDomain(doc);
    doc.addresses.forEach((address, i) => {
      address.isDefault = i === addressIndex;
    });
    await doc.save();
    return toDomain(doc);
  }

  async setResetCode(userId: string, codeHash: string, expiresAt: Date): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { resetCodeHash: codeHash, resetCodeExpiresAt: expiresAt });
  }

  async clearResetCode(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { $unset: { resetCodeHash: "", resetCodeExpiresAt: "" } });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { passwordHash, passwordChangedAt: new Date() });
  }
}
