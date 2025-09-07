FROM node:18-alpine AS base
WORKDIR /app

# Enable corepack to get pnpm
RUN corepack enable

# Copy manifests early to leverage Docker layer caching
COPY package.json .npmrc ./

FROM base AS deps
# Install using the exact lockfile for reproducible installs
RUN pnpm install

FROM deps AS build
COPY . .
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
ARG NEXT_SKIP_DB=1
ENV NEXT_SKIP_DB=$NEXT_SKIP_DB
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
RUN corepack enable
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

# Create entrypoint script to run migrations at runtime, then start the app
RUN printf "#!/bin/sh\nset -e\n\nif [ -z \"$DATABASE_URL\" ]; then\n  echo 'DATABASE_URL is not set; skipping migrations'\nelse\n  echo 'Running database migrations...'\n  npx drizzle-kit migrate --config=./drizzle.config.ts || { echo 'Migrations failed'; exit 1; }\nfi\n\nexec pnpm start\n" > /app/entrypoint.sh \
  && chmod +x /app/entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]
