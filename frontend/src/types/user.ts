export type UserRole = "customer" | "admin";

export interface Address {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode?: string;
  country: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  addresses: Address[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: SafeUser;
  tokens: AuthTokens;
}
