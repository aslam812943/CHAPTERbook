import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env";

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

let client: OAuth2Client | null = null;

function getClient(): OAuth2Client {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new Error("Google sign-in is not configured - set GOOGLE_CLIENT_ID in the backend .env.");
  }
  if (!client) {
    client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  }
  return client;
}

// Verifies the ID token the frontend gets back from Google Identity
// Services (the "Sign in with Google" button) - checks the signature,
// issuer, expiry, and that it was actually issued for OUR client ID
// (audience), so a token minted for a different app can't be replayed here.
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  const ticket = await getClient().verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw new Error("Invalid Google token payload");
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email,
    emailVerified: payload.email_verified ?? false,
  };
}
