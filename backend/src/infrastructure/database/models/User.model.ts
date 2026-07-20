import { Schema, model, Document, Types } from "mongoose";
import { UserRole } from "../../../domain/entities/User";

export interface AddressSubdocument {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode?: string;
  country: string;
}

export interface UserDocument extends Document<Types.ObjectId> {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  addresses: AddressSubdocument[];
  resetCodeHash?: string;
  resetCodeExpiresAt?: Date;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<AddressSubdocument>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String },
    country: { type: String, required: true },
  },
  { _id: false }
);

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    addresses: { type: [addressSchema], default: [] },
    resetCodeHash: { type: String },
    resetCodeExpiresAt: { type: Date },
    passwordChangedAt: { type: Date },
  },
  { timestamps: true }
);

export const UserModel = model<UserDocument>("User", userSchema);
