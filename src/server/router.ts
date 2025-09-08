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
import { and, eq, or } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { globalCache } from "../lib/cache";
import { publicProcedure, protectedProcedure, adminProcedure } from "../lib/trpc-middleware";
import { generateToken, getUserFromToken } from "../lib/auth";
import { REGISTRATION_SECRET, REGISTRATION_ENABLED } from "../lib/security";
import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

async function getOrCreateCategoryByName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const existing = await db.select().from(categories).where(eq(categories.name, trimmed)).limit(1);
  if (existing.length > 0) return existing[0];
  const inserted = await db
    .insert(categories)
    .values({ name: trimmed, slug: trimmed })
    .returning({ id: categories.id, name: categories.name, slug: categories.slug });
  return inserted[0] as Category;
}

async function getDefaultCategory() {
  const defaultName = "未分类";
  const existing = await db.select().from(categories).where(eq(categories.name, defaultName)).limit(1);
  if (existing.length > 0) return existing[0];
  const inserted = await db
    .insert(categories)
    .values({ name: defaultName, slug: "uncategorized" })
    .returning({ id: categories.id, name: categories.name, slug: categories.slug });
  return inserted[0] as Category;
}

function extractFirstImageUrl(html: string | undefined | null): string | undefined {
  if (!html) return undefined;
  const imgMatch = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
  if (imgMatch && imgMatch[1]) return imgMatch[1];
  return undefined;
}

export const appRouter = t.router({
  posts: publicProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(
      async ({ input }): Promise<
        (Post & { category: Category | null; tags: Tag[] })[]
      > => {
        const categoryFilter = input?.category?.trim();
        const cacheKey = `posts_home_${categoryFilter || "all"}`;
        const cached = globalCache.get(cacheKey);
        if (cached) return cached as any;

        let whereClause = eq(posts.status, "published");
        let filterCategoryId: number | null = null;
        if (categoryFilter && categoryFilter !== "all") {
          const catRow = await db
            .select()
            .from(categories)
            .where(or(eq(categories.slug, categoryFilter), eq(categories.name, categoryFilter)))
            .limit(1);
          if (catRow.length > 0) filterCategoryId = (catRow[0].id as number) || null;
          if (filterCategoryId) {
            whereClause = and(whereClause, eq(posts.categoryId, filterCategoryId));
          } else {
            // If category filter specified but not found, return empty
            return [];
          }
        }

        const basePosts: Post[] = await db
          .select()
          .from(posts)
          .where(whereClause);

        const categoriesMap: Record<number, Category> = {};
        const catRows: Category[] = await db.select().from(categories);
        catRows.forEach((c) => (categoriesMap[c.id as number] = c));

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
        const result = basePosts.map((p) => ({
          ...p,
          category: p.categoryId ? categoriesMap[p.categoryId] || null : null,
          tags: postTagMap[p.id as number] || [],
        }));
        globalCache.set(cacheKey, result, 60000);
        return result;
      }
    ),
  listCategories: publicProcedure.query(async (): Promise<Category[]> => {
    await getDefaultCategory();
    const rows = await db.select().from(categories);
    return rows;
  }),
  authRegister: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6, "Password must be at least 6 characters"),
        secret: z.string().min(1, "Registration secret is required"),
      })
    )
    .mutation(async ({ input }) => {
      const { email, password, secret } = input;
      
      // Check if registration is enabled
      if (!REGISTRATION_ENABLED) {
        throw new Error("Registration is currently disabled");
      }
      
      // Verify registration secret
      if (secret !== REGISTRATION_SECRET) {
        throw new Error("Invalid registration secret");
      }
      
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
  createPost: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().optional().default(""),
        cover: z.string().url().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional().default([]),
        status: z.enum(["draft", "published"]).optional().default("draft"),
      })
    )
    .mutation(async ({ input }) => {
      const { title, content, cover, category, tags: tagNames, status } = input;
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
        // category with default
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
        } else {
          const defCat = await getDefaultCategory();
          categoryId = defCat.id as number;
        }

        const derivedCover = cover || extractFirstImageUrl(content);

        const insertedPost = await tx
          .insert(posts)
          .values({ title, content, slug, categoryId, status, cover: derivedCover })
          .returning({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            content: posts.content,
            cover: posts.cover,
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
  listAdminPosts: adminProcedure.query(async () => {
    try {
      const rows = await db.select().from(posts);
      return rows;
    } catch (err) {
      console.error("listAdminPosts error", err);
      return [];
    }
  }),
  updatePost: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        content: z.string().optional(),
        cover: z.string().url().optional().or(z.literal("").transform(v => undefined)),
        status: z.enum(["draft", "published"]).optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, category, ...rest } = input;

      const existing = await db.query.posts.findFirst({ where: (p, { eq: eq2 }) => eq2(p.id, id) });

      const updateData: any = { ...rest };
      if (category !== undefined) {
        if (category && category.trim().length > 0) {
          const cat = await getOrCreateCategoryByName(category);
          updateData.categoryId = (cat as any)?.id as number;
        } else {
          const defCat = await getDefaultCategory();
          updateData.categoryId = (defCat as any)?.id as number;
        }
      }
      if ((rest.cover === undefined || rest.cover === (undefined as any)) && rest.content !== undefined) {
        const currentCover = (existing as any)?.cover as string | null | undefined;
        if (!currentCover) {
          const derived = extractFirstImageUrl(rest.content as string);
          if (derived) updateData.cover = derived;
        }
      }

      const updated = await db
        .update(posts)
        .set(updateData)
        .where(eq(posts.id, id))
        .returning({
          id: posts.id,
          title: posts.title,
          status: posts.status,
          content: posts.content,
        });
      return { post: updated[0] };
    }),
  updatePostStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["draft", "published"]) }))
    .mutation(async ({ input }) => {
      const updated = await db
        .update(posts)
        .set({ status: input.status })
        .where(eq(posts.id, input.id))
        .returning({ id: posts.id, status: posts.status });
      return { post: updated[0] };
    }),
  authLogin: publicProcedure
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
      // Generate proper JWT token
      const token = generateToken({ id: user.id, email: user.email });
      return { user: { id: user.id, email: user.email }, token };
    }),
  verifyToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const { token } = input;
      
      try {
        const user = await getUserFromToken(token);
        if (!user) {
          return { valid: false, user: null };
        }
        
        return { valid: true, user };
      } catch (error) {
        return { valid: false, user: null };
      }
    }),
  r2GetUploadUrl: adminProcedure
    .input(
      z.object({
        filename: z.string().min(1),
        contentType: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const accountId = process.env.R2_ACCOUNT_ID as string;
      const accessKeyId = process.env.R2_ACCESS_KEY_ID as string;
      const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY as string;
      const bucket = process.env.R2_BUCKET as string;
      const publicBase = process.env.R2_PUBLIC_BASE_URL as string; // e.g. https://cdn.example.com or https://<account>.r2.cloudflarestorage.com/<bucket>

      if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBase) {
        throw new Error("R2 env not configured");
      }

      const key = `${Date.now()}-${Math.random().toString(36).slice(2)}-${input.filename}`;
      const s3 = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });
      const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: input.contentType });
      const url = await getSignedUrl(s3, command, { expiresIn: 60 });
      const publicUrl = `${publicBase.replace(/\/$/, "")}/${key}`;
      return { uploadUrl: url, publicUrl, key };
    }),
});

export type AppRouter = typeof appRouter;
