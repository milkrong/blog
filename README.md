# blog

Next.js blog.

## Running with Docker Compose

```bash
docker-compose up --build
```

The application will be available at http://localhost:3000.

### Environment Variables

Create a `.env` file in the project root or define variables in `docker-compose.yml` under the `environment` key. For example:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=...
R2_PUBLIC_BASE_URL=https://your-public-r2-domain
```

These variables are loaded by Next.js during build and runtime.

### Database Migrations

Run migrations against local Postgres:

```
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
pnpm db:migrate
```

Then run the migration commands:

```
npm run db:generate
npm run db:push
```

The generated SQL files will be placed in the `drizzle` directory.
