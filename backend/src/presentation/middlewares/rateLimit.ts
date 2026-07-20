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
