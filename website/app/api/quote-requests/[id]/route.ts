import { getQuoteDatabase } from "../../../../db";
import { quoteSchema } from "../../../../lib/quote-config";
import {
  ApiError,
  assertAdmin,
  json,
  readWritePayload,
  routeFailure,
  savedRequest,
  type RequestRow,
} from "../../../../lib/quote-server";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    await assertAdmin();
    const { id } = await context.params;
    const row = await getQuoteDatabase()
      .prepare("SELECT * FROM quote_requests WHERE id = ?")
      .bind(id)
      .first<RequestRow>();
    if (!row) throw new ApiError("Richiesta non trovata.", 404);
    return json({ request: savedRequest(row) });
  } catch (error) {
    return routeFailure(error);
  }
}
export async function PUT(request: Request, context: Context) {
  try {
    await assertAdmin();
    const { id } = await context.params;
    const parsed = quoteSchema.safeParse(
      await readWritePayload(request, 180000),
    );
    if (!parsed.success)
      throw new ApiError(
        "Verifica le lavorazioni, le quantità, i prezzi e le condizioni del preventivo.",
      );
    const quote = parsed.data;
    const db = getQuoteDatabase();
    const row = await db
      .prepare(
        "UPDATE quote_requests SET quote = ?, revision = revision + 1, updated_at = ?, status = ? WHERE id = ? AND revision = ? RETURNING *",
      )
      .bind(
        JSON.stringify({ ...quote, revision: quote.revision + 1 }),
        new Date().toISOString(),
        quote.status === "ready" ? "quoted" : "review",
        id,
        quote.revision,
      )
      .first<RequestRow>();
    if (!row) {
      const exists = await db
        .prepare("SELECT id FROM quote_requests WHERE id = ?")
        .bind(id)
        .first();
      throw new ApiError(
        exists
          ? "Il preventivo è stato modificato da un’altra sessione. Ricarica la richiesta prima di salvarlo."
          : "Richiesta non trovata.",
        exists ? 409 : 404,
      );
    }
    return json({ request: savedRequest(row) });
  } catch (error) {
    return routeFailure(error);
  }
}
