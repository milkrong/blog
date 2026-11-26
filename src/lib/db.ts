import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema";

declare global {
  interface CloudflareEnv {
    HYPERDRIVE?: {
      connectionString: string;
    };
  }
}

export type AppDatabase = PostgresJsDatabase<typeof schema>;

// Survives Next.js dev reloads so the Node pool is not duplicated.
const nodePools: Map<string, Sql> = ((globalThis as { __blogNodePools?: Map<string, Sql> })
  .__blogNodePools ??= new Map());

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function isWorkersRuntime(): boolean {
  return typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
}

/**
 * Workers cannot share I/O across requests, and Hyperdrive already pools the
 * upstream connections, so those clients are created per call and closed once
 * idle. On Node (`pnpm dev`, `next start`) one pool is reused. postgres.js
 * leaves connections open forever when `idle_timeout` is unset, so a new pool
 * per query would exhaust Postgres.
 *
 * `prepare: true` is required: Hyperdrive's transaction pool can hang when
 * postgres.js disables prepared statements.
 */
export async function getDb(): Promise<AppDatabase> {
  const connectionString = await resolveConnectionString();
  const client = isWorkersRuntime()
    ? postgres(connectionString, {
        // One Worker request may open at most 6 concurrent external connections.
        max: 5,
        fetch_types: false,
        prepare: true,
        // Seconds. Release the socket after the request instead of holding it
        // for the life of the isolate. Null would mean never.
        idle_timeout: 5,
      })
    : nodePool(connectionString);
  return drizzle(client, { schema });
}

function nodePool(connectionString: string): Sql {
  const existing = nodePools.get(connectionString);
  if (existing) return existing;
  const created = postgres(connectionString, {
    max: 10,
    fetch_types: false,
    prepare: true,
  });
  nodePools.set(connectionString, created);
  return created;
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
