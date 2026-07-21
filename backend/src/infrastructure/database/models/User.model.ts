import { Schema, model, Document, Types } from "mongoose";
import { AuthProvider, UserRole } from "../../../domain/entities/User";

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
  passwordHash?: string;
  role: UserRole;
  authProvider: AuthProvider;
  googleId?: string;
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
    // Required for local accounts only - Google-only accounts never get one.
    passwordHash: {
      type: String,
      required: function (this: { authProvider?: AuthProvider }) {
        return this.authProvider !== "google";
      },
    },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    // sparse: a unique index that ignores documents where the field is
    // absent, so local accounts (no googleId) don't collide with each other.
    googleId: { type: String, unique: true, sparse: true },
    addresses: { type: [addressSchema], default: [] },
    resetCodeHash: { type: String },
    resetCodeExpiresAt: { type: Date },
    passwordChangedAt: { type: Date },
  },
  { timestamps: true }
);

export const UserModel = model<UserDocument>("User", userSchema);
