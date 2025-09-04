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
NEXT_PUBLIC_ANALYTICS_ID=your-id
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_DB_URL=postgresql://postgres:password@host:5432/postgres?sslmode=require
```

These variables are loaded by Next.js during build and runtime.

### Database Migrations

Drizzle ORM is used to manage the `posts` table schema. To generate and push migrations to your Supabase instance, first set `SUPABASE_DB_URL` to the service-role connection string provided by Supabase:

```
export SUPABASE_DB_URL="postgresql://postgres:password@host:5432/postgres?sslmode=require"
```

Then run the migration commands:

```
npm run db:generate
npm run db:push
```

The generated SQL files will be placed in the `drizzle` directory.
