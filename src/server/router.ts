import { initTRPC } from '@trpc/server';
import { db } from '../lib/db';
import { posts, Post } from '../lib/schema';

const t = initTRPC.create();

export const appRouter = t.router({
  posts: t.procedure.query(async (): Promise<Post[]> => {
    return await db.select().from(posts);
  }),
});

export type AppRouter = typeof appRouter;
