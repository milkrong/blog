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
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";

const t = initTRPC.create();

export const appRouter = t.router({
  posts: t.procedure.query(
    async (): Promise<
      (Post & { category: Category | null; tags: Tag[] })[]
    > => {
      // get posts
      const basePosts: Post[] = await db
        .select()
        .from(posts)
        .where(eq(posts.status, "published"));
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
  createPost: t.procedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().optional().default(""),
        category: z.string().optional(),
        tags: z.array(z.string()).optional().default([]),
        status: z.enum(["draft", "published"]).optional().default("draft"),
      })
    )
    .mutation(async ({ input }) => {
      const { title, content, category, tags: tagNames, status } = input;
      const slugBase = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      // ensure unique slug
      let slug = slugBase || "post";
      let i = 1;
      while (
        (
          await db
            .select({ id: posts.id })
            .from(posts)
            .where(eq(posts.slug, slug))
        )?.length > 0
      ) {
        slug = `${slugBase}-${i++}`;
      }

      return await db.transaction(async (tx) => {
        // category
        let categoryId: number | null = null;
        if (category && category.trim().length > 0) {
          const existingCat = await tx
            .select()
            .from(categories)
            .where(eq(categories.name, category))
            .limit(1);
          if (existingCat.length > 0) {
            categoryId = existingCat[0].id as number;
          } else {
            const insertedCat = await tx
              .insert(categories)
              .values({ name: category, slug: category })
              .returning({ id: categories.id });
            categoryId = insertedCat[0].id as number;
          }
        }

        const insertedPost = await tx
          .insert(posts)
          .values({ title, content, slug, categoryId, status })
          .returning({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            content: posts.content,
            categoryId: posts.categoryId,
            createdAt: posts.createdAt,
            status: posts.status,
          });
        const postId = insertedPost[0].id as number;

        const tagRecords: { id: number; name: string; slug: string }[] = [];
        for (const rawName of tagNames || []) {
          const name = rawName.trim();
          if (!name) continue;
          const existingTag = await tx
            .select()
            .from(tags)
            .where(eq(tags.name, name))
            .limit(1);
          let tagId: number;
          if (existingTag.length > 0) {
            tagId = existingTag[0].id as number;
            tagRecords.push({
              id: tagId,
              name: existingTag[0].name as string,
              slug: existingTag[0].slug as string,
            });
          } else {
            const insertedTag = await tx
              .insert(tags)
              .values({ name, slug: name })
              .returning({ id: tags.id, name: tags.name, slug: tags.slug });
            tagId = insertedTag[0].id as number;
            tagRecords.push(insertedTag[0] as any);
          }
          await tx.insert(postsToTags).values({ postId, tagId });
        }

        // build category object if any
        let categoryObj: Category | null = null;
        if (categoryId !== null) {
          const catRow = await tx
            .select()
            .from(categories)
            .where(eq(categories.id, categoryId))
            .limit(1);
          if (catRow.length > 0) categoryObj = catRow[0] as any;
        }

        return {
          post: {
            ...insertedPost[0],
            category: categoryObj,
            tags: tagRecords,
          },
        };
      });
    }),
  listAdminPosts: t.procedure.query(async () => {
    try {
      const rows = await db.select().from(posts);
      return rows;
    } catch (err) {
      console.error("listAdminPosts error", err);
      return [];
    }
  }),
  updatePost: t.procedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        content: z.string().optional(),
        status: z.enum(["draft", "published"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const updated = await db
        .update(posts)
        .set(rest)
        .where(eq(posts.id, id))
        .returning({
          id: posts.id,
          title: posts.title,
          status: posts.status,
          content: posts.content,
        });
      return { post: updated[0] };
    }),
  updatePostStatus: t.procedure
    .input(z.object({ id: z.number(), status: z.enum(["draft", "published"]) }))
    .mutation(async ({ input }) => {
      const updated = await db
        .update(posts)
        .set({ status: input.status })
        .where(eq(posts.id, input.id))
        .returning({ id: posts.id, status: posts.status });
      return { post: updated[0] };
    }),
  authLogin: t.procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { email, password } = input;
      const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, email),
      });
      if (!user) {
        throw new Error("Invalid email or password");
      }
      const valid = await bcrypt.compare(password, user.passwordHash as string);
      if (!valid) {
        throw new Error("Invalid email or password");
      }
      // For now just return a placeholder token (could integrate JWT later)
      const token = `local-${user.id}`;
      return { user: { id: user.id, email: user.email }, token };
    }),
});

export type AppRouter = typeof appRouter;
