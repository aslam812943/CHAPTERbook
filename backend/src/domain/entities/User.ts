export type UserRole = "customer" | "admin";

export interface Address {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode?: string;
  country: string;
}

export type AuthProvider = "local" | "google";

export interface User {
  id: string;
  name: string;
  email: string;
  // Absent for Google-only accounts - never a placeholder/empty string, so
  // "has a password" is always a genuine presence check.
  passwordHash?: string;
  role: UserRole;
  authProvider: AuthProvider;
  googleId?: string;
  addresses: Address[];
  // Password reset - a hashed, single-use, short-expiry code (never the
  // plain code) plus when it stops being valid. Cleared once used.
  resetCodeHash?: string;
  resetCodeExpiresAt?: Date;
  // Set on every password change (including via reset). A reset token
  // issued before this timestamp is stale and rejected, even if it hasn't
  // technically expired yet - otherwise the same reset token could be
  // replayed to reset the password again within its 10-minute window.
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  // Exactly one of these two should be set: passwordHash for a normal
  // signup, googleId for a Google-only account.
  passwordHash?: string;
  authProvider?: AuthProvider;
  googleId?: string;
  role?: UserRole;
}
