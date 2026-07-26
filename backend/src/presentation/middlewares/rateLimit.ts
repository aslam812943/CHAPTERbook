import rateLimit from "express-rate-limit";

// Google Books / Open Library are called with no API key by default, so an
// admin session hammering the search box could get this server's IP
// rate-limited upstream. Keep this generous enough for normal typing/search
// use but cap runaway usage.
export const bookSearchRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many book searches, please slow down." },
});

// A 6-digit reset code only has a million combinations - without a cap on
// attempts, it's brute-forceable well within its 15-minute expiry. Same
// limiter also throttles /forgot-password itself so it can't be used to
// spam an inbox.
export const passwordResetRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later." },
});

// Without this, a password can be brute-forced at unlimited rate - 10
// attempts/15min is far too slow to crack a real password but generous
// enough not to lock out someone who just mistyped it a few times.
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later." },
});

// Looser than login - registration isn't a credential-guessing target, but
// still worth capping against automated signup spam/abuse.
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many accounts created from this network, please try again later." },
});

// This requires a valid access token already, so it's not an anonymous
// brute-force vector - but it's still a current-password check, so it
// deserves the same defense-in-depth as login.
export const changePasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later." },
});
