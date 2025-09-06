import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

console.log(
  "Connecting to database...",
  connectionString ? "✔" : "✘"
);

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
