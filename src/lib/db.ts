import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

type DbStore = {
  pool?: pg.Pool;
  local?: Promise<PGlite>;
};

const store: DbStore = ((globalThis as { __frameDb?: DbStore }).__frameDb ??= {});

export async function sql<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (databaseUrl !== "") {
    store.pool ??= new pg.Pool({ connectionString: databaseUrl, max: 5 });
    return (await store.pool.query(text, params)).rows as T[];
  }
  store.local ??= startLocal().catch((error: unknown) => {
    store.local = undefined;
    throw error;
  });
  return (await (await store.local).query<T>(text, params)).rows;
}

async function startLocal(): Promise<PGlite> {
  const db = new PGlite();
  const files = (await readdir("migrations").catch(() => []))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  for (const file of files) {
    await db.exec(await readFile(`migrations/${file}`, "utf8"));
  }
  return db;
}
