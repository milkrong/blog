import { initTRPC } from "@trpc/server";
import { db } from "../lib/db";
import {
  Post,
  Category,
  Tag,
  users,
  posts,
  categories,
  postsToTags,
  tags,
} from "../lib/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";

const t = initTRPC.create();

export const appRouter = t.router({
  posts: t.procedure.query(
    async (): Promise<
      (Post & { category: Category | null; tags: Tag[] })[]
    > => {
      // get posts
      const basePosts: Post[] = await db.select().from(posts);
      // categories lookup
      const categoriesMap: Record<number, Category> = {};
      const catRows: Category[] = await db.select().from(categories);
      catRows.forEach((c) => (categoriesMap[c.id as number] = c));
      // tags per post
      const ptRows = await db.select().from(postsToTags);
      const tagRows: Tag[] = await db.select().from(tags);
      const tagMap: Record<number, Tag> = {};
      tagRows.forEach((t) => (tagMap[t.id as number] = t));
      const postTagMap: Record<number, Tag[]> = {};
      ptRows.forEach((pt: any) => {
        if (!postTagMap[pt.post_id]) postTagMap[pt.post_id] = [];
        const tg = tagMap[pt.tag_id];
        if (tg) postTagMap[pt.post_id].push(tg);
      });
      return basePosts.map((p) => ({
        ...p,
        category: p.categoryId ? categoriesMap[p.categoryId] || null : null,
        tags: postTagMap[p.id as number] || [],
      }));
    }
  ),
  authRegister: t.procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6, "Password must be at least 6 characters"),
      })
    )
    .mutation(async ({ input }) => {
      const { email, password } = input;
      // check existing
      const existing = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, email),
      });
      if (existing) {
        throw new Error("Email already registered");
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const inserted = await db
        .insert(users)
        .values({ email, passwordHash })
        .returning({ id: users.id, email: users.email });
      return { user: inserted[0] };
    }),
});

export type AppRouter = typeof appRouter;
