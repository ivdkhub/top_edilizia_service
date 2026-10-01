import { cookies } from "next/headers";

// Single-password admin access: the session cookie is `<expiry>.<hmac>`,
// signed with ADMIN_SESSION_SECRET, so no session storage is needed.
export const ADMIN_COOKIE = "tes_admin";
const SESSION_SECONDS = 60 * 60 * 12;
const encoder = new TextEncoder();

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV !== "production") return "dev-only-session-secret-not-for-production";
  throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters.");
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), (v) =>
    v.toString(16).padStart(2, "0"),
  ).join("");
}

// Comparing HMACs of both values keeps the comparison length-independent.
async function safeEqual(a: string, b: string) {
  const [x, y] = await Promise.all([hmac(`cmp:${a}`), hmac(`cmp:${b}`)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

export async function checkAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(password, expected);
}

export async function createAdminSession() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  return {
    value: `${expires}.${await hmac(`session:${expires}`)}`,
    maxAge: SESSION_SECONDS,
  };
}

export async function isAdminSession() {
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) * 1000 < Date.now())
    return false;
  return safeEqual(signature, await hmac(`session:${expires}`));
}

export function safeReturnPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/admin") || value.startsWith("//"))
    return "/admin";
  return value;
}
