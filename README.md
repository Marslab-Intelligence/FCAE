# FCAE

SIDCORPTECH marketing site + client portal built with **Next.js 16 (App Router)**, **Tailwind CSS 4**, **Drizzle ORM**, and **PostgreSQL 16** (via Docker).

---

## Database workflow

The app uses a local PostgreSQL 16 database running in a Docker container, managed by Docker Compose. All schema changes go through Drizzle migrations.

### Quick reference

| Command                 | What it does                                                           |
| ----------------------- | ---------------------------------------------------------------------- |
| `npm run db:up`         | Start the database and apply any pending migrations                    |
| `npm run db:down`       | Stop and remove the container (data is **kept** in the named volume)   |
| `npm run db:status`     | Show whether the database container is running                         |
| `npm run db:logs`       | Follow the database container logs                                     |
| `npm run db:generate`   | Generate a new migration from `src/db/schema.ts` changes               |
| `npm run db:migrate`    | Apply pending migrations                                                |
| `npm run db:studio`     | Open the Drizzle Studio UI to inspect/edit data                        |

### First-time setup

```bash
npm install
npm run db:up        # starts Postgres on port 5434 and runs migrations
npm run dev          # start the site on http://localhost:3000
```

`db:up` is idempotent — running it on an already-running database is a no-op
apart from re-applying migrations.

### Configuration (`.env`)

The database connection is driven by environment variables. Copy `.env.example`
to `.env` (or edit the existing `.env`, which already has all keys) and fill in:

```bash
# Local dev database (Docker container: mercury-landing-postgres)
DATABASE_URL="postgresql://mercury:YOUR_PASSWORD@localhost:5434/mercury_landing"

# Used by docker-compose.yml to create the container (defaults below are safe for local dev)
POSTGRES_USER="mercury"
POSTGRES_PASSWORD="YOUR_PASSWORD"
POSTGRES_DB="mercury_landing"
```

> `DATABASE_URL` and the `POSTGRES_*` variables **must match** — the app connects
> with `DATABASE_URL`, while Docker creates the user/database from `POSTGRES_*`.

### Docker Compose (`docker-compose.yml`)

```bash
docker compose up -d db   # same as npm run db:up (without migrations)
docker compose ps         # check container status
docker compose down       # stop (data persists in the named volume)
docker compose logs -f db # tail database logs
```

Details:

- **Image:** `postgres:16-alpine`
- **Port:** `5434:5432` (host port 5434 → container port 5432)
- **Volume:** named volume `mercury-landing-pgdata`, so data survives
  `docker compose down` and container recreation. Never delete this volume
  unless you intend to wipe the database.
- **Healthcheck:** `pg_isready` — `npm run db:up` waits for the container to be
  healthy before running migrations.
- **Restart policy:** `unless-stopped` — the container comes back automatically
  after reboots or Docker restarts, so the site's auth lookups never point at a
  dead database.

### Making schema changes (the normal workflow)

1. Edit the schema in **`src/db/schema.ts`** (the single source of truth).
2. Generate a migration:
   ```bash
   npm run db:generate
   ```
   This creates a new timestamped file under `drizzle/`.
3. Apply it (starts the DB first if it's not running):
   ```bash
   npm run db:up
   ```

Migration files live in `drizzle/` and are committed to the repo. The current
tables: `users`, `sessions`, `saved_plans`, `otp_tokens`.

### Troubleshooting

- **`connect ECONNREFUSED 127.0.0.1:5434`** — the database container is not
  running. Fix: `npm run db:up`. This was a recurring production issue until the
  container was migrated to Compose control with `restart: unless-stopped`.
- **Auth behaves as logged-out even when you're signed in** — likely the DB is
  down. `src/lib/auth.ts` has a circuit breaker: after a DB failure it skips
  session lookups for 15s and logs at most once per minute, so a dead DB
  degrades to anonymous visitors instead of crashing requests. Once the DB is
  back, logins work again without re-signing-in.
- **`relation "users" does not exist`** — migrations haven't been applied.
  Fix: `npm run db:up`.
- **Port 5434 already in use** — another Postgres is running on that port.
  Stop it, or change the host port mapping in `docker-compose.yml` and
  `DATABASE_URL` together.
- **Volume warning on `docker compose up`** — if the volume pre-exists outside
  Compose control, Compose prints a harmless warning and reuses your data.

---

## Development

```bash
npm run dev      # start dev server (Turbopack by default in Next 16)
npm run lint     # ESLint (eslint src)
npm run build    # production build
npm run start    # serve the production build
```

## Stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS 4
- Drizzle ORM + PostgreSQL 16 (Docker)
- Three.js / React Three Fiber (interactive 3D scenes)
- GSAP, Lenis, Framer Motion (animations)
