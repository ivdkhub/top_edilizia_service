import { headers } from "next/headers";
import { isAdminSession } from "./admin-auth";
import type { QuoteRequest, Quote, SavedRequest } from "./quote-config";
export async function adminIdentity() {
  const allowed = await isAdminSession();
  return { authenticated: allowed, allowed };
}
export async function clientIp() {
  const h = await headers();
  return (
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    "local"
  );
}
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function assertAdmin() {
  const identity = await adminIdentity();
  if (!identity.allowed)
    throw new ApiError(
      identity.authenticated
        ? "Accesso riservato all’amministrazione."
        : "Accedi all’area riservata.",
      identity.authenticated ? 403 : 401,
    );
}
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export function routeFailure(error: unknown) {
  if (error instanceof ApiError)
    return json({ error: error.message }, error.status);
  console.error("Quote operation failed", error);
  return json(
    {
      error:
        "Servizio temporaneamente non disponibile. I dati non sono stati inviati: riprova.",
    },
    503,
  );
}
export async function readWritePayload(request: Request, maxBytes = 30000) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    throw new ApiError("Origine della richiesta non valida.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new ApiError("Formato della richiesta non valido.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError("Richiesta vuota.");
  let size = 0,
    text = "";
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new ApiError("La richiesta è troppo lunga.", 413);
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError("Richiesta non valida.");
  }
}
export type RequestRow = {
  id: string;
  created_at: string;
  updated_at: string;
  payload: string;
  status: string;
  quote: string | null;
  revision: number;
};
export function savedRequest(row: RequestRow): SavedRequest {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    request: JSON.parse(row.payload) as QuoteRequest,
    quote: row.quote ? (JSON.parse(row.quote) as Quote) : null,
    revision: row.revision,
  };
}
export const requestReference = (id: string) =>
  `TES-${id.slice(0, 8).toUpperCase()}`;
