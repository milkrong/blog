import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
// relations import removed (temporarily not using drizzle relations helpers)
// Added users table for authentication

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    emailUnique: uniqueIndex("users_email_unique").on(t.email),
  })
);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
  categoryId: integer("category_id").references(() => categories.id),
});

export const postsToTags = pgTable(
  "posts_to_tags",
  {
    postId: integer("post_id").references(() => posts.id),
    tagId: integer("tag_id").references(() => tags.id),
  },
  (t) => ({
    pk: primaryKey(t.postId, t.tagId),
  })
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
