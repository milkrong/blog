import { initTRPC } from '@trpc/server';
import { db } from '../lib/db';
import { Post, Category, Tag } from '../lib/schema';

const t = initTRPC.create();

export const appRouter = t.router({
  posts: t.procedure.query(
    async (): Promise<(Post & { category: Category | null; tags: Tag[] })[]> => {
      const rows = await db.query.posts.findMany({
        with: {
          category: true,
          tags: { with: { tag: true } },
        },
      });

      return rows.map(({ tags, ...post }) => ({
        ...post,
        tags: tags.map((t) => t.tag),
      }));
    }
  ),
});

export type AppRouter = typeof appRouter;
