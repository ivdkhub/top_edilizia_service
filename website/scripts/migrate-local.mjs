import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
await mkdir(".sites-runtime", { recursive: true });
const config = ".sites-runtime/d1-local.json";
await writeFile(
  config,
  JSON.stringify(
    {
      name: "top-edilizia-local",
      compatibility_date: "2026-05-15",
      d1_databases: [
        {
          binding: "DB",
          database_name: "site-creator-d1",
          database_id: "00000000-0000-4000-8000-000000000000",
          migrations_dir: "../drizzle",
        },
      ],
    },
    null,
    2,
  ),
);
const result = spawnSync(
  process.execPath,
  [
    "node_modules/wrangler/bin/wrangler.js",
    "d1",
    "migrations",
    "apply",
    "site-creator-d1",
    "--local",
    "--config",
    config,
    "--persist-to",
    ".wrangler/state",
  ],
  {
    stdio: "inherit",
    env: { ...process.env, CI: "true", WRANGLER_SEND_METRICS: "false" },
  },
);
process.exitCode = result.status ?? 1;
