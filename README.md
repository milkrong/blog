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
```

These variables are loaded by Next.js during build and runtime.
