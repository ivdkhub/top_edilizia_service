import { getQuoteDatabase } from "../../../db";
import { requestSchema } from "../../../lib/quote-config";
import {
  ApiError,
  assertAdmin,
  json,
  readWritePayload,
  requestReference,
  routeFailure,
  savedRequest,
  type RequestRow,
} from "../../../lib/quote-server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    await assertAdmin();
    const cursor = new URL(request.url).searchParams.get("cursor");
    const db = getQuoteDatabase();
    let before: { date: string; id: string } | null = null;
    if (cursor) {
      try {
        before = JSON.parse(atob(cursor));
      } catch {
        throw new ApiError("Pagina non valida.");
      }
      if (
        !before ||
        !/^\d{4}-\d{2}-\d{2}T/.test(before.date) ||
        !/^[a-f0-9-]{36}$/.test(before.id)
      )
        throw new ApiError("Pagina non valida.");
    }
    const query = before
      ? db
          .prepare(
            "SELECT * FROM quote_requests WHERE created_at < ? OR (created_at = ? AND id < ?) ORDER BY created_at DESC, id DESC LIMIT 51",
          )
          .bind(before.date, before.date, before.id)
      : db.prepare(
          "SELECT * FROM quote_requests ORDER BY created_at DESC, id DESC LIMIT 51",
        );
    const result = await query.all<RequestRow>();
    const rows = result.results.slice(0, 50),
      last = rows[rows.length - 1];
    const stats = await db
      .prepare(
        "SELECT COUNT(*) AS total, SUM(status = 'new') AS newCount, SUM(status = 'quoted') AS quoted FROM quote_requests",
      )
      .first();
    return json({
      requests: rows.map(savedRequest),
      nextCursor:
        result.results.length > 50
          ? btoa(JSON.stringify({ date: last.created_at, id: last.id }))
          : null,
      stats,
    });
  } catch (error) {
    return routeFailure(error);
  }
}
export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await readWritePayload(request));
    if (!parsed.success) throw new ApiError(parsed.error.issues[0].message);
    const data = parsed.data;
    if (data.website)
      return json({ reference: requestReference(data.id) }, 201);
    delete data.website;
    const payload = JSON.stringify(data),
      db = getQuoteDatabase();
    const previous = await db
      .prepare("SELECT payload FROM quote_requests WHERE id = ?")
      .bind(data.id)
      .first<{ payload: string }>();
    if (previous) {
      if (previous.payload !== payload)
        throw new ApiError(
          "Questa richiesta è già stata inviata. Avvia una nuova richiesta.",
          409,
        );
      return json({ reference: requestReference(data.id) });
    }
    const hour = Math.floor(Date.now() / 3600000);
    const ip = request.headers.get("cf-connecting-ip") || "local";
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${hour}:${ip}`),
    );
    const key = Array.from(new Uint8Array(digest), (v) =>
      v.toString(16).padStart(2, "0"),
    ).join("");
    await db
      .prepare("DELETE FROM quote_rate_limits WHERE expires_at < ?")
      .bind(Date.now())
      .run();
    const limit = await db
      .prepare(
        "INSERT INTO quote_rate_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count",
      )
      .bind(key, (hour + 2) * 3600000)
      .first<{ count: number }>();
    if (limit && limit.count > 20)
      throw new ApiError(
        "Hai inviato molte richieste. Riprova più tardi o contattaci direttamente.",
        429,
      );
    const now = new Date().toISOString();
    const result = await db
      .prepare(
        "INSERT INTO quote_requests (id, created_at, updated_at, payload, status, revision) VALUES (?, ?, ?, ?, 'new', 0) ON CONFLICT(id) DO NOTHING",
      )
      .bind(data.id, now, now, payload)
      .run();
    if (result.meta.changes === 0) {
      const concurrent = await db
        .prepare("SELECT payload FROM quote_requests WHERE id = ?")
        .bind(data.id)
        .first<{ payload: string }>();
      if (concurrent?.payload !== payload)
        throw new ApiError("Richiesta già presente con altri dati.", 409);
    }
    return json({ reference: requestReference(data.id) }, 201);
  } catch (error) {
    return routeFailure(error);
  }
}
