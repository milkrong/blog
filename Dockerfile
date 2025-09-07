FROM node:18-alpine AS base
WORKDIR /app

# Enable corepack to get pnpm
RUN corepack enable && apk add --no-cache libc6-compat postgresql-client

# Copy manifests early to leverage Docker layer caching
COPY package.json .npmrc ./

FROM base AS deps
# Install using the exact lockfile for reproducible installs
COPY pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
ARG NEXT_SKIP_DB=1
ENV NEXT_SKIP_DB=$NEXT_SKIP_DB
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
RUN corepack enable && apk add --no-cache libc6-compat postgresql-client
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# Copy necessary files from build stage
COPY --from=build /app/package.json ./package.json
# next.config.js 不存在于仓库，若未来添加再复制；当前删除该行避免构建报错
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src/lib/schema.ts ./src/lib/schema.ts
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/supabase ./supabase
COPY --from=build /app/package.json ./package.json

# Create entrypoint script to wait for DB, run migrations, then start the app
RUN cat <<'SH' > /app/entrypoint.sh
#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo 'DATABASE_URL is not set; skipping migrations'
else
  echo 'Waiting for database to be ready...'
  until pg_isready -d "$DATABASE_URL" >/dev/null 2>&1; do
    sleep 1
  done
  if [ ! -f ./drizzle.config.ts ]; then
    echo 'drizzle.config.ts not found; creating one dynamically'
    echo 'import { defineConfig } from "drizzle-kit";' > ./drizzle.config.ts
    echo 'export default defineConfig({' >> ./drizzle.config.ts
    echo '  schema: "./src/lib/schema.ts",' >> ./drizzle.config.ts
    echo '  out: "./supabase/migrations",' >> ./drizzle.config.ts
    echo '  dialect: "postgresql",' >> ./drizzle.config.ts
    echo '  dbCredentials: { url: process.env.DATABASE_URL! },' >> ./drizzle.config.ts
    echo '});' >> ./drizzle.config.ts
  fi
  echo 'Running database migrations (drizzle-kit)...'
  pnpm drizzle-kit generate || { echo 'Migrations failed'; exit 1; }
fi

exec pnpm start
SH
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]
