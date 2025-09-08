import { initTRPC, TRPCError } from '@trpc/server';
import { getUserFromToken, extractTokenFromHeader } from './auth';

export const t = initTRPC.create();

// Public procedure (no auth required)
export const publicProcedure = t.procedure;

// Protected procedure (requires authentication)
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  // For Next.js API routes, we need to get the token from the request headers
  const authHeader = (ctx as any).req?.headers?.authorization;
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No authentication token provided',
    });
  }

  const user = await getUserFromToken(token);
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user,
    },
  });
});

// Admin procedure (requires admin role - for future use)
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // For now, all authenticated users are admins
  // In the future, you can add role-based access control here
  return next({ ctx });
});