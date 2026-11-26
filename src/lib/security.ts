// Security configuration and validation.
// Read env inside functions. Module scope can run before Workers copies
// secrets onto process.env, which would freeze empty values for the isolate.

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function validateEnvironment() {
  const jwtSecret = readEnv("JWT_SECRET");

  if (!jwtSecret) {
    throw new Error("Missing required environment variables: JWT_SECRET");
  }

  if (jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }

  if (jwtSecret === "your-super-secret-jwt-key-change-this-in-production") {
    console.warn("⚠️  WARNING: Using default JWT_SECRET. Change this in production!");
  }
}

export function getJwtSecret(): string {
  validateEnvironment();
  return readEnv("JWT_SECRET") as string;
}

export function generateSecureJWTSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Known insecure fallback. Registration stays open to anyone who knows it
// until REGISTRATION_SECRET is set with `wrangler secret put`.
const DEFAULT_REGISTRATION_SECRET = "admin-registration-secret-2024";

export function getRegistrationSecret(): string {
  return readEnv("REGISTRATION_SECRET") ?? DEFAULT_REGISTRATION_SECRET;
}

// Enabled unless the value is exactly "false".
export function isRegistrationEnabled(): boolean {
  return readEnv("REGISTRATION_ENABLED") !== "false";
}

// Rate limiting configuration
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: 5,
  LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  REGISTER_ATTEMPTS: 3,
  REGISTER_WINDOW_MS: 60 * 60 * 1000, // 1 hour
} as const;

// Security headers
export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
} as const;
