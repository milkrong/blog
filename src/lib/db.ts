import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  interface CloudflareEnv {
    HYPERDRIVE?: {
      connectionString: string;
    };
  }
}

export type AppDatabase = PostgresJsDatabase<typeof schema>;

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * Workers cannot share I/O across requests, and Hyperdrive already pools the
 * upstream connections. Create a client for the current request only.
 * `prepare: true` is required: Hyperdrive's transaction pool can hang when
 * postgres.js disables prepared statements.
 */
export async function getDb(): Promise<AppDatabase> {
  const connectionString = await resolveConnectionString();
  const client = postgres(connectionString, {
    // One Worker request may open at most 6 concurrent external connections.
    max: 5,
    // The schema has no array columns, so the extra type-lookup round trip is unnecessary.
    fetch_types: false,
    prepare: true,
  });
  return drizzle(client, { schema });
}

async function resolveConnectionString(): Promise<string> {
  const fromEnv = readEnv("DATABASE_URL");
  // `next dev` should follow .env.local even when wrangler also simulates Hyperdrive.
  if (process.env.NODE_ENV === "development" && fromEnv) return fromEnv;

  try {
    // Async mode is required for getStaticProps / ISR. In a Worker request the
    // context is already on the global; otherwise this falls through to wrangler
    // local bindings or throws outside a request.
    const { env } = await getCloudflareContext({ async: true });
    const hyperdriveUrl = env.HYPERDRIVE?.connectionString;
    if (hyperdriveUrl) return hyperdriveUrl;
  } catch {
    // `next build` has no request binding. `next dev` uses DATABASE_URL above.
  }

  if (fromEnv) return fromEnv;
  throw new Error(
    "Database is not configured. In production, bind HYPERDRIVE to a TLS Postgres. For local dev and drizzle-kit, set DATABASE_URL."
  );
}
