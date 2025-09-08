// Security configuration and validation

export function validateEnvironment() {
  const requiredEnvVars = [
    'JWT_SECRET',
    'DATABASE_URL'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  // Warn about default JWT secret
  if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
    console.warn('⚠️  WARNING: Using default JWT_SECRET. Change this in production!');
  }
}

export function generateSecureJWTSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Registration security
export const REGISTRATION_SECRET = process.env.REGISTRATION_SECRET || 'admin-registration-secret-2024';
export const REGISTRATION_ENABLED = process.env.REGISTRATION_ENABLED !== 'false'; // Default to true, set to 'false' to disable

// Rate limiting configuration
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: 5,
  LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  REGISTER_ATTEMPTS: 3,
  REGISTER_WINDOW_MS: 60 * 60 * 1000, // 1 hour
} as const;

// Security headers
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;