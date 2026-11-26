import jwt from "jsonwebtoken";
import { getDb } from "./db";
import { getJwtSecret } from "./security";

const JWT_EXPIRES_IN = "7d";

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
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  const payload = verifyToken(token);
  if (!payload) return null;

  try {
    const db = await getDb();
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, payload.userId),
      columns: { id: true, email: true },
    });

    return user || null;
  } catch {
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}
