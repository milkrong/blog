FROM node:18-alpine AS base
WORKDIR /app

# Enable corepack to get pnpm
RUN corepack enable

# Copy only manifest (no lock file for now)
COPY package.json ./

FROM base AS deps
# Install without lock file (will generate a new lock internally)
RUN pnpm install --no-frozen-lockfile

FROM deps AS build
COPY . .
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# Copy necessary files from build stage
COPY --from=build /app/package.json ./package.json
# Copy next.config.js if present (will fail build if missing, acceptable) ; wrap in multi-stage optional improvement if needed
COPY --from=build /app/next.config.js ./next.config.js
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src/lib/schema.ts ./src/lib/schema.ts

EXPOSE 3000
CMD ["pnpm", "start"]
