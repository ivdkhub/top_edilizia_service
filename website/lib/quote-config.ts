import { z } from "zod";
export const serviceIds = [
  "renovation",
  "restoration",
  "construction",
  "new-build",
] as const;
export const scopes = ["Residenziale", "Commerciale", "Industriale"] as const;
export const workOptions = [
  {
    id: "interiors",
    title: "Interni",
    description: "Distribuzione e valorizzazione degli spazi",
  },
  {
    id: "facades",
    title: "Facciate ed esterni",
    description: "Recupero delle superfici esterne",
  },
  {
    id: "roof",
    title: "Tetti e coperture",
    description: "Rifacimento e protezione dell’edificio",
  },
  {
    id: "terraces",
    title: "Terrazze",
    description: "Impermeabilizzazione delle superfici",
  },
  {
    id: "systems",
    title: "Impianti",
    description: "Elettrico, idrico e riscaldamento",
  },
  {
    id: "windows",
    title: "Serramenti",
    description: "Finestre, porte e isolamento",
  },
  {
    id: "finishes",
    title: "Pavimenti e finiture",
    description: "Rivestimenti, intonaci e tinteggiatura",
  },
  {
    id: "demolition",
    title: "Demolizioni",
    description: "Rimozioni e gestione dei materiali",
  },
] as const;
export const units = ["m²", "m", "m³", "cad", "a corpo"] as const;
const measure = z
  .string()
  .trim()
  .max(20)
  .refine(
    (v) =>
      !v ||
      (/^\d+(?:[.,]\d{1,3})?$/.test(v) &&
        Number(v.replace(",", ".")) > 0 &&
        Number(v.replace(",", ".")) <= 1000000),
    "Inserisci una misura positiva valida.",
  );
const optionalText = (max = 500) => z.string().trim().max(max);
export const requestSchema = z.object({
  id: z.string().uuid(),
  service: z.enum(serviceIds),
  scope: z.enum(scopes),
  works: z
    .array(
      z.object({
        id: z.enum([
          "interiors",
          "facades",
          "roof",
          "terraces",
          "systems",
          "windows",
          "finishes",
          "demolition",
        ]),
        quantity: measure,
        unit: z.enum(units),
        details: optionalText(600),
      }),
    )
    .max(8)
    .refine((rows) => new Set(rows.map((r) => r.id)).size === rows.length),
  propertyType: z.enum([
    "Appartamento",
    "Casa / villa",
    "Condominio",
    "Negozio / ufficio",
    "Capannone",
    "Altro",
  ]),
  city: z.string().trim().min(2, "Indica il comune dell’immobile.").max(150),
  address: z
    .string()
    .trim()
    .min(3, "Indica l’indirizzo dell’immobile.")
    .max(250),
  postalCode: z
    .string()
    .trim()
    .regex(/^(\d{5})?$/, "Il CAP deve avere 5 cifre."),
  area: measure,
  floors: measure,
  rooms: measure,
  condition: z.enum([
    "Da valutare",
    "Da ristrutturare",
    "Parzialmente ristrutturato",
    "Grezzo",
    "Nuova costruzione",
  ]),
  occupancy: z.enum(["Libero", "Abitato / in uso", "Da definire"]),
  quality: z.enum([
    "Da valutare insieme",
    "Essenziale",
    "Intermedia",
    "Alta gamma",
  ]),
  design: z.enum([
    "Da definire",
    "Non ancora disponibile",
    "In corso",
    "Progetto disponibile",
  ]),
  permits: z.enum([
    "Da verificare",
    "Da richiedere",
    "In corso",
    "Già disponibili",
  ]),
  budget: z.enum([
    "Da valutare insieme",
    "Fino a 20.000 €",
    "20.000 – 50.000 €",
    "50.000 – 100.000 €",
    "100.000 – 250.000 €",
    "Oltre 250.000 €",
  ]),
  timing: z.enum([
    "Da concordare",
    "Entro 3 mesi",
    "Tra 3 e 6 mesi",
    "Tra 6 e 12 mesi",
    "Oltre 12 mesi",
  ]),
  deadline: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/),
  access: optionalText(1000),
  description: z
    .string()
    .trim()
    .min(20, "Descrivi il progetto con almeno 20 caratteri.")
    .max(5000),
  documentsUrl: z
    .string()
    .trim()
    .max(2000)
    .refine(
      (v) =>
        !v ||
        (/^https?:\/\//i.test(v) &&
          (() => {
            try {
              new URL(v);
              return true;
            } catch {
              return false;
            }
          })()),
      "Inserisci un link http o https valido.",
    ),
  name: z.string().trim().min(2, "Inserisci nome e cognome.").max(150),
  email: z
    .string()
    .trim()
    .email("Inserisci un indirizzo email valido.")
    .max(250),
  phone: z
    .string()
    .trim()
    .min(6, "Inserisci un recapito telefonico.")
    .max(40)
    .regex(/^[+()\d\s./-]+$/, "Inserisci un telefono valido."),
  company: optionalText(200),
  taxId: optionalText(40),
  notes: optionalText(3000),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "Conferma di aver letto l’informativa privacy.",
    }),
  }),
  website: z.string().max(200).optional(),
});
export type QuoteRequest = z.infer<typeof requestSchema>;
export type QuoteRequestDraft = Omit<QuoteRequest, "consent"> & {
  consent: boolean;
};
export const initialRequest = (): QuoteRequestDraft => ({
  id: "",
  service: "renovation",
  scope: "Residenziale",
  works: [],
  propertyType: "Appartamento",
  city: "",
  address: "",
  postalCode: "",
  area: "",
  floors: "",
  rooms: "",
  condition: "Da valutare",
  occupancy: "Da definire",
  quality: "Da valutare insieme",
  design: "Da definire",
  permits: "Da verificare",
  budget: "Da valutare insieme",
  timing: "Da concordare",
  deadline: "",
  access: "",
  description: "",
  documentsUrl: "",
  name: "",
  email: "",
  phone: "",
  company: "",
  taxId: "",
  notes: "",
  consent: false,
  website: "",
});
export const quoteSchema = z
  .object({
    reference: z.string().trim().min(1).max(100),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((value) => {
        const d = new Date(`${value}T12:00:00Z`);
        return (
          Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value
        );
      }),
    validityDays: z.number().int().min(1).max(365),
    lines: z
      .array(
        z.object({
          id: z.string().uuid(),
          description: z.string().trim().min(1).max(1500),
          quantity: z
            .number()
            .min(0.001)
            .max(1000000)
            .refine((v) => Math.abs(v * 1000 - Math.round(v * 1000)) < 0.00001),
          unit: z.enum(units),
          unitPrice: z
            .number()
            .nonnegative()
            .max(10000000)
            .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 0.00001),
          vat: z
            .number()
            .min(0)
            .max(100)
            .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 0.00001),
        }),
      )
      .min(1)
      .max(100),
    discount: z
      .number()
      .min(0)
      .max(100)
      .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 0.00001),
    schedule: optionalText(3000),
    payment: optionalText(3000),
    inclusions: optionalText(3000),
    exclusions: optionalText(3000),
    notes: optionalText(5000),
    status: z.enum(["draft", "ready"]),
    revision: z.number().int().nonnegative(),
  })
  .refine(
    (q) => new Set(q.lines.map((line) => line.id)).size === q.lines.length,
    "Ogni lavorazione deve avere un identificativo distinto.",
  )
  .refine(
    (q) =>
      q.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0) <=
      1000000000000,
    "Importo del preventivo fuori scala.",
  )
  .refine(
    (q) =>
      q.status !== "ready" ||
      (q.discount < 100 &&
        q.lines.some((l) => l.unitPrice > 0) &&
        quoteTotals(q).total > 0),
    "Completa gli importi prima di segnare il preventivo come pronto.",
  );
export type Quote = z.infer<typeof quoteSchema>;
export type SavedRequest = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  request: QuoteRequest;
  quote: Quote | null;
  revision: number;
};
export function quoteTotals(quote: {
  lines: Array<{ quantity: number; unitPrice: number; vat: number }>;
  discount: number;
}) {
  const lines = quote.lines.map((line) => {
    if (
      ![line.quantity, line.unitPrice, line.vat, quote.discount].every(
        Number.isFinite,
      ) ||
      Math.abs(line.quantity) > 1000000 ||
      Math.abs(line.unitPrice) > 10000000 ||
      Math.abs(line.vat) > 100 ||
      Math.abs(quote.discount) > 100
    )
      return { gross: 0, net: 0, vat: 0, total: 0 };
    // Integer arithmetic keeps decimal quantities and cent rounding consistent
    // between the editor, saved records and the printed document.
    const unitCents = Math.round(line.unitPrice * 100);
    const quantityThousandths = Math.round(line.quantity * 1000);
    const gross = Number(
      (BigInt(unitCents) * BigInt(quantityThousandths) + BigInt(500)) /
        BigInt(1000),
    );
    const discountBasisPoints = Math.round(quote.discount * 100);
    const vatBasisPoints = Math.round(line.vat * 100);
    const net = Number(
      (BigInt(gross) * BigInt(10000 - discountBasisPoints) + BigInt(5000)) /
        BigInt(10000),
    );
    const vat = Number(
      (BigInt(net) * BigInt(vatBasisPoints) + BigInt(5000)) / BigInt(10000),
    );
    return { gross, net, vat, total: net + vat };
  });
  const gross = lines.reduce((sum, l) => sum + l.gross, 0),
    net = lines.reduce((sum, l) => sum + l.net, 0),
    vat = lines.reduce((sum, l) => sum + l.vat, 0);
  return { lines, gross, discount: gross - net, net, vat, total: net + vat };
}
export const currency = (cents: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
