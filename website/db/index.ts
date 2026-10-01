import { createClient, type Client, type InValue } from "@libsql/client";

// Turso/libSQL client exposed through the small D1-style surface the quote
// routes use (prepare → bind → all/first/run), so their SQL stays unchanged.
let client: Client | undefined;

function getClient(): Client {
  if (client) return client;
  const url =
    process.env.TURSO_DATABASE_URL ||
    (process.env.NODE_ENV === "production" ? "" : "file:.data/local.db");
  if (!url) throw new Error("TURSO_DATABASE_URL is not configured.");
  client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return client;
}

class Statement {
  constructor(
    private sql: string,
    private args: InValue[] = [],
  ) {}

  bind(...args: InValue[]) {
    return new Statement(this.sql, args);
  }

  private async execute() {
    return getClient().execute({ sql: this.sql, args: this.args });
  }

  async all<T = Record<string, unknown>>() {
    const result = await this.execute();
    return {
      results: result.rows.map(
        (row) =>
          Object.fromEntries(
            result.columns.map((column, index) => [column, row[index]]),
          ) as T,
      ),
    };
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    return (await this.all<T>()).results[0] ?? null;
  }

  async run() {
    const result = await this.execute();
    return { meta: { changes: result.rowsAffected } };
  }
}

export function getQuoteDatabase() {
  return { prepare: (sql: string) => new Statement(sql) };
}
