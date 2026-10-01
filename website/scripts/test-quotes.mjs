import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  initialRequest,
  requestSchema,
  quoteSchema,
  quoteTotals,
} from "../lib/quote-config.ts";
const base = "http://127.0.0.1:5173";
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
        headers: {
          "oai-authenticated-user-id": "local_seedy",
          "oai-authenticated-user-email": "spoof@example.invalid",
        },
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
  const login = await fetch(`${base}/signin-with-chatgpt?return_to=/admin`, {
    redirect: "manual",
  });
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
    const cleanup = spawnSync(
      process.execPath,
      [
        "node_modules/wrangler/bin/wrangler.js",
        "d1",
        "execute",
        "site-creator-d1",
        "--local",
        "--config",
        ".sites-runtime/d1-local.json",
        "--persist-to",
        ".wrangler/state",
        "--command",
        `DELETE FROM quote_requests WHERE id = '${id}' AND json_extract(payload, '$.email') = 'api-test@example.invalid'`,
      ],
      {
        encoding: "utf8",
        env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
      },
    );
    assert.equal(
      cleanup.status,
      0,
      "Pulizia della sola richiesta sintetica di test non riuscita.",
    );
    console.log("Richiesta sintetica del test API rimossa.");
  }
}
