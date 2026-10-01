import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
export const quoteRequests = sqliteTable(
  "quote_requests",
  {
    id: text("id").primaryKey(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    payload: text("payload").notNull(),
    status: text("status").notNull().default("new"),
    quote: text("quote"),
    revision: integer("revision").notNull().default(0),
  },
  (table) => [index("quote_requests_created_idx").on(table.createdAt)],
);
export const quoteRateLimits = sqliteTable("quote_rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  expiresAt: integer("expires_at").notNull(),
});
