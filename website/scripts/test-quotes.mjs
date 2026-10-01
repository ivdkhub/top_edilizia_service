import assert from "node:assert/strict";
import { createClient } from "@libsql/client";
import {
  initialRequest,
  requestSchema,
  quoteSchema,
  quoteTotals,
} from "../lib/quote-config.ts";
try {
  process.loadEnvFile(".env.local");
} catch {}
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const password = process.env.ADMIN_PASSWORD;
assert.ok(password, "Imposta ADMIN_PASSWORD per eseguire il test.");
const id = crypto.randomUUID();
const request = {
  ...initialRequest(),
  id,
  city: "Saronno",
  address: "Indirizzo sintetico di test",
  description:
    "Richiesta sintetica per collaudare persistenza e validazione del preventivo.",
  name: "TEST API automatizzato",
  email: "api-test@example.invalid",
  phone: "0000000000",
  consent: true,
};
const quote = {
  reference: "TEST-API",
  date: "2026-09-30",
  validityDays: 30,
  discount: 10,
  status: "draft",
  revision: 0,
  schedule: "",
  payment: "",
  inclusions: "",
  exclusions: "",
  notes: "",
  lines: [
    {
      id: crypto.randomUUID(),
      description: "Lavorazione sintetica",
      quantity: 50,
      unit: "m²",
      unitPrice: 100,
      vat: 22,
    },
  ],
};
assert.equal(requestSchema.safeParse(request).success, true);
assert.equal(
  requestSchema.safeParse({ ...request, consent: false }).success,
  false,
);
assert.equal(
  quoteSchema.safeParse({ ...quote, date: "2026-02-30" }).success,
  false,
);
assert.equal(
  quoteSchema.safeParse({
    ...quote,
    lines: [{ ...quote.lines[0], unitPrice: -1 }],
  }).success,
  false,
);
assert.equal(
  quoteSchema.safeParse({
    ...quote,
    status: "ready",
    lines: [{ ...quote.lines[0], unitPrice: 0 }],
  }).success,
  false,
);
assert.equal(
  quoteSchema.safeParse({
    ...quote,
    status: "ready",
    lines: [{ ...quote.lines[0], quantity: 0.001, unitPrice: 0.01 }],
  }).success,
  false,
);
assert.equal(
  quoteTotals({ discount: 0, lines: [{ ...quote.lines[0], unitPrice: 1e308 }] })
    .total,
  0,
);
assert.deepEqual(quoteTotals(quote), {
  lines: [{ gross: 500000, net: 450000, vat: 99000, total: 549000 }],
  gross: 500000,
  discount: 50000,
  net: 450000,
  vat: 99000,
  total: 549000,
});
assert.equal(
  quoteTotals({
    discount: 0,
    lines: [{ ...quote.lines[0], quantity: 0.35, unitPrice: 0.3, vat: 0 }],
  }).total,
  11,
);
assert.equal(
  quoteTotals({
    discount: 0,
    lines: [
      { ...quote.lines[0], quantity: 2, unitPrice: 1.01, vat: 10 },
      { ...quote.lines[0], quantity: 1, unitPrice: 10, vat: 22 },
    ],
  }).total,
  1442,
);
let created = false;
try {
  assert.equal((await fetch(`${base}/api/quote-requests`)).status, 401);
  assert.equal(
    (
      await fetch(`${base}/api/quote-requests`, {
        headers: { Cookie: "tes_admin=9999999999.forged" },
      })
    ).status,
    401,
  );
  const headers = { "Content-Type": "application/json", Origin: base };
  assert.equal(
    (
      await fetch(`${base}/api/quote-requests`, {
        method: "POST",
        headers: { ...headers, Origin: "https://example.invalid" },
        body: JSON.stringify(request),
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(`${base}/api/quote-requests`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ...request, consent: false }),
      })
    ).status,
    400,
  );
  const saved = await fetch(`${base}/api/quote-requests`, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });
  assert.equal(saved.status, 201);
  created = true;
  assert.equal(
    (
      await fetch(`${base}/api/quote-requests`, {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      })
    ).status,
    200,
  );
  const loginForm = (value) =>
    fetch(`${base}/api/admin/login`, {
      method: "POST",
      redirect: "manual",
      headers: { Origin: base },
      body: new URLSearchParams({ password: value, return_to: "/admin" }),
    });
  const rejected = await loginForm("password-errata");
  assert.match(rejected.headers.get("location") || "", /error=invalid/);
  assert.equal(rejected.headers.get("set-cookie"), null);
  const login = await loginForm(password);
  assert.equal(login.status, 303);
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie);
  const adminHeaders = { ...headers, Cookie: cookie };
  const detail = await fetch(`${base}/api/quote-requests/${id}`, {
    headers: adminHeaders,
  });
  assert.equal(detail.status, 200);
  assert.equal((await detail.json()).request.request.city, "Saronno");
  const updated = await fetch(`${base}/api/quote-requests/${id}`, {
    method: "PUT",
    headers: adminHeaders,
    body: JSON.stringify(quote),
  });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).request.revision, 1);
  assert.equal(
    (
      await fetch(`${base}/api/quote-requests/${id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: JSON.stringify(quote),
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await fetch(`${base}/api/quote-requests/${id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: JSON.stringify({
          ...quote,
          revision: 1,
          lines: [{ ...quote.lines[0], unitPrice: -1 }],
        }),
      })
    ).status,
    400,
  );
  const reload = await fetch(`${base}/api/quote-requests/${id}`, {
    headers: adminHeaders,
  });
  assert.equal((await reload.json()).request.quote.reference, "TEST-API");
  assert.equal(
    (await fetch(`${base}/admin/quotes/${id}`, { headers: { Cookie: cookie } }))
      .status,
    200,
  );
  console.log(
    "PASS: validazione, arrotondamenti, IVA, accesso riservato, origine, persistenza, idempotenza e conflitti di revisione.",
  );
} finally {
  if (created) {
    assert.match(id, /^[a-f0-9-]{36}$/);
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL || "file:.data/local.db",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    await db.execute({
      sql: "DELETE FROM quote_requests WHERE id = ? AND json_extract(payload, '$.email') = 'api-test@example.invalid'",
      args: [id],
    });
    console.log("Richiesta sintetica del test API rimossa.");
  }
}
