// Client-side JWT utilities (no database dependencies)
// WARNING: This is for UX only - NO SECURITY VALIDATION!
// Real JWT verification happens on the server side in tRPC middleware

export interface JWTPayload {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}

export function verifyTokenClient(token: string): JWTPayload | null {
  try {
    // Simple JWT decode without signature verification (client-side only)
    // This is ONLY for UX - to avoid unnecessary network requests
    // Real security validation happens on the server side
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = JSON.parse(atob(parts[1])) as JWTPayload;
    
    if (!payload || !payload.exp) {
      return null;
    }
    
    // Check if token is expired (client-side check only)
    if (payload.exp * 1000 < Date.now()) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = verifyTokenClient(token);
  return !payload;
}