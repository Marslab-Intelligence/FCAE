import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import postgres from 'postgres';
import { PGlite } from '@electric-sql/pglite';
import * as schema from './schema';

const dbUrl = process.env.DATABASE_URL;
const isLocal = !dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
const usePglite = isLocal || process.env.USE_PGLITE === 'true';

declare global {
  var __mercuryPgliteClient: PGlite | undefined;
  var __mercuryPgClient: ReturnType<typeof postgres> | undefined;
  var __mercuryDb: any | undefined;
}

function createClient() {
  if (usePglite) {
    const dataDir = path.resolve(process.cwd(), '.pgdata');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const client = globalThis.__mercuryPgliteClient ?? (globalThis.__mercuryPgliteClient = new PGlite(dataDir));

    // Auto-verify / run migrations
    client.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'"
    ).then((res) => {
      if (res.rows.length === 0) {
        const drizzleDir = path.resolve(process.cwd(), 'drizzle');
        if (fs.existsSync(drizzleDir)) {
          const sqlFiles = fs.readdirSync(drizzleDir).filter((f) => f.endsWith('.sql')).sort();
          sqlFiles.reduce((acc, file) => {
            return acc.then(() => {
              const sql = fs.readFileSync(path.join(drizzleDir, file), 'utf-8');
              return client.exec(sql).then(() => {});
            });
          }, Promise.resolve()).catch((err) => {
            console.warn('[DB] Migration error in PGlite:', err);
          });
        }
      }
    }).catch((err) => {
      console.warn('[DB] PGlite verification warning:', err);
    });

    return drizzlePglite(client, { schema });
  }

  const queryClient = globalThis.__mercuryPgClient ?? (globalThis.__mercuryPgClient = postgres(dbUrl!));
  return drizzlePg(queryClient, { schema });
}

export const db = (globalThis.__mercuryDb ?? (globalThis.__mercuryDb = createClient())) as ReturnType<typeof drizzlePg<typeof schema>>;
