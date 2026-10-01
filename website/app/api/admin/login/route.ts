import { getQuoteDatabase } from "../../../../db";
import {
  ADMIN_COOKIE,
  checkAdminPassword,
  createAdminSession,
  safeReturnPath,
} from "../../../../lib/admin-auth";
import { clientIp } from "../../../../lib/quote-server";
export const dynamic = "force-dynamic";
const MAX_ATTEMPTS_PER_HOUR = 10;
function redirectTo(request: Request, path: string) {
  return new Response(null, {
    status: 303,
    headers: { Location: new URL(path, request.url).toString() },
  });
}
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new Response("Origine della richiesta non valida.", { status: 403 });
  const form = await request.formData();
  const returnTo = safeReturnPath(String(form.get("return_to") || ""));
  const failure = (error: string) =>
    redirectTo(
      request,
      `/admin/login?error=${error}&return_to=${encodeURIComponent(returnTo)}`,
    );
  try {
    // Failed attempts share the quote rate-limit table, keyed per IP and hour.
    const hour = Math.floor(Date.now() / 3600000);
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`login:${hour}:${await clientIp()}`),
    );
    const key = Array.from(new Uint8Array(digest), (v) =>
      v.toString(16).padStart(2, "0"),
    ).join("");
    const db = getQuoteDatabase();
    const attempts = await db
      .prepare("SELECT count FROM quote_rate_limits WHERE key = ? AND expires_at > ?")
      .bind(key, Date.now())
      .first<{ count: number }>();
    if (attempts && attempts.count >= MAX_ATTEMPTS_PER_HOUR)
      return failure("limit");
    if (!(await checkAdminPassword(String(form.get("password") || "")))) {
      await db
        .prepare(
          "INSERT INTO quote_rate_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1",
        )
        .bind(key, (hour + 2) * 3600000)
        .run();
      return failure("invalid");
    }
    const session = await createAdminSession();
    const response = redirectTo(request, returnTo);
    response.headers.append(
      "Set-Cookie",
      `${ADMIN_COOKIE}=${session.value}; Path=/; Max-Age=${session.maxAge}; HttpOnly; SameSite=Lax${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
    );
    return response;
  } catch (error) {
    console.error("Admin login failed", error);
    return failure("unavailable");
  }
}
