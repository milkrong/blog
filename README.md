# blog

Next.js 15 Pages Router blog, deployed as a Cloudflare Worker with [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare). Postgres is reached through [Hyperdrive](https://developers.cloudflare.com/hyperdrive/). Image uploads use the R2 S3 API with presigned `PUT` URLs.

This repository does not deploy itself and does not create Cloudflare resources. The Wrangler ids below are placeholders.

## What you do in the Cloudflare account

1. Use the **Workers Paid** plan. Login and registration hash passwords with `bcryptjs` at cost 10. The Workers Free CPU limit (10ms) is too small and requests fail with error 1102. Paid raises the CPU limit (30s by default).

2. Use a **Postgres database Cloudflare can reach over TLS**. Hyperdrive cannot connect to a private Docker network. A hosted database (Supabase, Neon, or similar) is the straightforward option. A private database needs [Cloudflare Tunnel or Workers VPC](https://developers.cloudflare.com/hyperdrive/configuration/connect-to-private-database/).

3. Create the Hyperdrive config against that database's **direct** connection string (not a Hyperdrive URL):

   ```bash
   npx wrangler hyperdrive create blog-db --connection-string="postgres://USER:PASSWORD@HOST:5432/DB?sslmode=require"
   ```

   Copy the printed id into `wrangler.jsonc`, replacing `00000000-0000-0000-0000-000000000000`.

   Hyperdrive caches reads for about 60 seconds by default. That matches this site's ISR window. If a publish must be visible on the next request, recreate the config with `--caching-disabled`.

4. Create the R2 bucket used as the Next.js incremental cache and keep the name in `wrangler.jsonc` (`NEXT_INC_CACHE_R2_BUCKET`) in sync:

   ```bash
   npx wrangler r2 bucket create blog-incremental-cache
   ```

5. Create (or reuse) the **uploads** bucket. Presigned URLs are signed for `<accountid>.r2.cloudflarestorage.com`. An R2 binding cannot mint them, so the S3 API token stays.

   - `R2_PUBLIC_BASE_URL` must be a public read origin (custom domain or `r2.dev`). The `*.r2.cloudflarestorage.com` host is the S3 API, not a public website.
   - Add CORS on the uploads bucket so the browser can `PUT` the presigned URL. Allow the site origin and `http://localhost:3000`, methods `PUT` and `GET`, and the `Content-Type` header. The signer includes `Content-Type`; the browser sends the same value.

6. Replace the placeholder `vars` in `wrangler.jsonc`:

   - `R2_ACCOUNT_ID`
   - `R2_BUCKET` (uploads bucket, not the ISR cache bucket)
   - `R2_PUBLIC_BASE_URL`
   - `REGISTRATION_ENABLED` — `"true"` or `"false"`

7. Store secrets. These are not in `wrangler.jsonc`:

   ```bash
   npx wrangler secret put JWT_SECRET
   npx wrangler secret put REGISTRATION_SECRET
   npx wrangler secret put R2_ACCESS_KEY_ID
   npx wrangler secret put R2_SECRET_ACCESS_KEY
   ```

   `JWT_SECRET` must be at least 32 characters. If `REGISTRATION_SECRET` is unset, registration stays **enabled** and the server accepts the hardcoded fallback `admin-registration-secret-2024`. Set a real secret before the Worker is reachable, or set `REGISTRATION_ENABLED` to `"false"`.

8. Deploy when the placeholders are gone (this change does not deploy):

   ```bash
   pnpm deploy
   ```

   Attach a custom domain to the Worker in the dashboard. Dashboard variables survive a later deploy if you pass `--keep-vars` (`pnpm exec opennextjs-cloudflare deploy -- --keep-vars`).

## Local development

```bash
pnpm install
cp .env.example .env.local
# edit DATABASE_URL, JWT_SECRET, and the R2 values you need
pnpm dev
```

`pnpm dev` is `next dev` on http://localhost:3000. In development, `DATABASE_URL` wins over the local Hyperdrive string in `wrangler.jsonc`.

Point `DATABASE_URL` at any Postgres you can reach (a local server or a hosted dev database). Apply the schema with drizzle-kit — see below.

`pnpm preview` builds the OpenNext bundle and serves it with the Workers runtime. Wrangler simulates the placeholder Hyperdrive id locally. The default local target is `localConnectionString` in `wrangler.jsonc` (`postgresql://postgres:postgres@127.0.0.1:5432/postgres`). Override it in `.dev.vars` (do not commit that file):

```bash
CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE=postgresql://postgres:postgres@localhost:5432/postgres
```

## Database migrations

Migrations are not applied on Worker startup. Run them from a machine that can open a **direct** TLS connection to Postgres. Do not point drizzle-kit at a Hyperdrive connection string.

```bash
export DATABASE_URL="postgres://USER:PASSWORD@HOST:5432/DB?sslmode=require"
pnpm db:migrate
```

`pnpm db:generate` writes new SQL into `supabase/migrations` after schema changes. Run `pnpm db:migrate` locally or in CI. There is no deploy hook that migrates the database.

`pnpm build` sets `NEXT_SKIP_DB=1`. The Cloudflare build environment has no database, so the homepage is prerendered empty and filled by ISR (`revalidate: 60`) plus the client query. Post pages use `fallback: 'blocking'` and render on first request.

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Next.js production build, without a database |
| `pnpm preview` | OpenNext build, then Workers runtime locally |
| `pnpm deploy` | OpenNext build and `wrangler deploy` |
| `pnpm upload` | OpenNext build and upload a Worker version |
| `pnpm cf-typegen` | Regenerate `cloudflare-env.d.ts` from Wrangler |
| `pnpm lint` | `next lint` |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:generate` / `pnpm db:migrate` | drizzle-kit, direct `DATABASE_URL` |

## Layout

- `src/lib/db.ts` uses `env.HYPERDRIVE.connectionString` with `prepare: true`. On Workers that client is per request and closes after it is idle. `pnpm dev` and `next start` reuse one pool for `DATABASE_URL`.
- `src/pages/api/trpc/[trpc].ts` stays a Node Pages API route. Do not set `runtime = "edge"`.
- `open-next.config.ts` stores ISR in R2 and dedupes revalidation with a Durable Object queue. There is no tag cache.
- Presigned uploads stay on `@aws-sdk/client-s3` in `r2GetUploadUrl`.
