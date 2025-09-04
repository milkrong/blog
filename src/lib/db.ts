import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.SUPABASE_DB_URL!;

console.log(
  "Connecting to database...",
  process.env.SUPABASE_DB_URL ? "✔" : "✘"
);

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
