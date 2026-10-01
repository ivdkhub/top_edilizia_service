// Applies the SQL files in drizzle/ to the Turso database (or the local file
// database when TURSO_DATABASE_URL is unset). Already applied files are skipped.
import { readdirSync, readFileSync, mkdirSync } from "node:fs";
import { createClient } from "@libsql/client";

try {
  process.loadEnvFile(".env.local");
} catch {}

const url = process.env.TURSO_DATABASE_URL || "file:.data/local.db";
if (url.startsWith("file:")) mkdirSync(".data", { recursive: true });
const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });

await db.execute(
  "CREATE TABLE IF NOT EXISTS __migrations (name text PRIMARY KEY, applied_at text NOT NULL)",
);
const applied = new Set(
  (await db.execute("SELECT name FROM __migrations")).rows.map((r) => r.name),
);
const files = readdirSync("drizzle")
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of files) {
  if (applied.has(file)) continue;
  const statements = readFileSync(`drizzle/${file}`, "utf8")
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  await db.batch(
    [
      ...statements,
      {
        sql: "INSERT INTO __migrations (name, applied_at) VALUES (?, ?)",
        args: [file, new Date().toISOString()],
      },
    ],
    "write",
  );
  console.log(`Applicata: ${file}`);
}
console.log(`Database aggiornato (${url.split("?")[0]}).`);
