import jwt from 'jsonwebtoken';
import { db } from './db';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import { validateEnvironment } from './security';

// Validate environment on module load
validateEnvironment();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';

export interface AuthUser {
  id: number;
  email: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  const payload = verifyToken(token);
  if (!payload) return null;

  try {
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, payload.userId),
      columns: { id: true, email: true }
    });
    
    return user || null;
  } catch (error) {
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}