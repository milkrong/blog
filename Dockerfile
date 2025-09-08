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
  
  # Parse DATABASE_URL to extract connection parameters
  # Format: postgresql://user:password@host:port/database
  DB_URL="$DATABASE_URL"
  DB_HOST=$(echo "$DB_URL" | sed 's/.*@\([^:]*\):.*/\1/')
  DB_PORT=$(echo "$DB_URL" | sed 's/.*:\([0-9]*\)\/.*/\1/')
  DB_USER=$(echo "$DB_URL" | sed 's/.*:\/\/\([^:]*\):.*/\1/')
  DB_NAME=$(echo "$DB_URL" | sed 's/.*\/\([^?]*\).*/\1/')
  
  # Set defaults if parsing failed
  DB_HOST=${DB_HOST:-db}
  DB_PORT=${DB_PORT:-5432}
  DB_USER=${DB_USER:-postgres}
  DB_NAME=${DB_NAME:-postgres}
  
  echo "Checking database connection: $DB_HOST:$DB_PORT as $DB_USER"
  
  # Wait for database with timeout (max 60 seconds)
  TIMEOUT=60
  ELAPSED=0
  until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; do
    if [ $ELAPSED -ge $TIMEOUT ]; then
      echo "Database connection timeout after ${TIMEOUT}s"
      echo "Database may not be ready or connection parameters are incorrect"
      echo "DB_HOST: $DB_HOST, DB_PORT: $DB_PORT, DB_USER: $DB_USER, DB_NAME: $DB_NAME"
      exit 1
    fi
    echo "Database not ready yet, waiting... (${ELAPSED}s/${TIMEOUT}s)"
    sleep 2
    ELAPSED=$((ELAPSED + 2))
  done
  
  echo "Database is ready!"
  
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
  pnpm drizzle-kit migrate || { echo 'Migrations failed'; exit 1; }
fi

exec pnpm start
SH
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]
