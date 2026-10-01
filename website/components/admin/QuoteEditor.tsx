"use client";
import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import {
  currency,
  quoteSchema,
  quoteTotals,
  serviceIds,
  units,
  workOptions,
  type Quote,
  type SavedRequest,
} from "../../lib/quote-config";
import { services } from "../../lib/company";
import RequestDetails from "./RequestDetails";
function fromRequest(record: SavedRequest): Quote {
  if (record.quote) return record.quote;
  const r = record.request;
  return {
    reference: `PREV-${new Date().getFullYear()}-${record.id.slice(0, 8).toUpperCase()}`,
    date: new Date().toISOString().slice(0, 10),
    validityDays: 30,
    discount: 0,
    schedule: "",
    payment: "",
    inclusions: "",
    exclusions: "",
    notes: "",
    status: "draft",
    revision: record.revision,
    lines: r.works.length
      ? r.works.map((work) => ({
          id: crypto.randomUUID(),
          description: `${workOptions.find((w) => w.id === work.id)?.title}${work.details ? ` — ${work.details}` : ""}${work.quantity ? "" : " — quantità da verificare"}`,
          quantity: work.quantity ? Number(work.quantity.replace(",", ".")) : 1,
          unit: work.quantity ? work.unit : "a corpo",
          unitPrice: 0,
          vat: 0,
        }))
      : [
          {
            id: crypto.randomUUID(),
            description: services[serviceIds.indexOf(r.service)].title,
            quantity: 1,
            unit: "a corpo",
            unitPrice: 0,
            vat: 0,
          },
        ],
  };
}
export default function QuoteEditor({
  record,
  onSaved,
  onDirtyChange,
}: {
  record: SavedRequest;
  onSaved: (record: SavedRequest) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [quote, setQuote] = useState<Quote | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [dirty, setDirty] = useState(false);
  useEffect(() => {
    setQuote(fromRequest(record));
    setDirty(false);
  }, [record.id]);
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [dirty]);
  if (!quote) return <p>Preparazione del preventivo…</p>;
  const update = <K extends keyof Quote>(key: K, value: Quote[K]) => {
    setQuote((previous) =>
      previous ? { ...previous, [key]: value } : previous,
    );
    setDirty(true);
    setMessage("");
  };
  const line = (index: number, key: string, value: unknown) =>
    update(
      "lines",
      quote.lines.map((row, i) =>
        i === index ? { ...row, [key]: value } : row,
      ),
    );
  const totals = quoteTotals(quote);
  const save = async (status: Quote["status"]) => {
    const candidate = { ...quote, status };
    const parsed = quoteSchema.safeParse(candidate);
    if (!parsed.success || (status === "ready" && totals.total <= 0)) {
      setError(
        "Completa le lavorazioni con quantità e prezzi validi. Per un preventivo pronto, il totale deve essere maggiore di zero.",
      );
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/quote-requests/${record.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json()) as {
        error?: string;
        request: SavedRequest;
      };
      if (!response.ok) throw new Error(data.error);
      setQuote(data.request.quote);
      onSaved(data.request);
      setDirty(false);
      setMessage(
        status === "ready"
          ? "Preventivo pronto e salvato. Puoi aprire la versione stampabile."
          : "Bozza salvata.",
      );
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Salvataggio non riuscito.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="admin-editor-layout">
      <aside className="admin-project">
        <RequestDetails record={record} />
      </aside>
      <div className="admin-quote">
        <h2>Componi il preventivo</h2>
        <p className="admin-editor-note">
          Verifica le misure e inserisci prezzi, aliquote IVA e condizioni per
          ogni lavorazione.
        </p>
        <div className="quote-fields">
          <label className="quote-field">
            <span>Numero preventivo</span>
            <input
              value={quote.reference}
              maxLength={100}
              onChange={(e) => update("reference", e.target.value)}
            />
          </label>
          <label className="quote-field">
            <span>Data</span>
            <input
              type="date"
              value={quote.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </label>
          <label className="quote-field">
            <span>Validità (giorni)</span>
            <input
              type="number"
              min={1}
              max={365}
              value={quote.validityDays}
              onChange={(e) => update("validityDays", Number(e.target.value))}
            />
          </label>
          <label className="quote-field">
            <span>Sconto sul totale imponibile (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={quote.discount}
              onChange={(e) => update("discount", Number(e.target.value))}
            />
          </label>
        </div>
        <div className="quote-line-list">
          {quote.lines.map((row, index) => (
            <fieldset className="quote-line" key={row.id}>
              <legend>Lavorazione {index + 1}</legend>
              <label className="quote-field">
                <span>Descrizione della lavorazione</span>
                <textarea
                  value={row.description}
                  maxLength={1500}
                  onChange={(e) => line(index, "description", e.target.value)}
                />
              </label>
              <div className="quote-line-numbers">
                <label className="quote-field">
                  <span>Quantità</span>
                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={row.quantity}
                    onChange={(e) =>
                      line(index, "quantity", Number(e.target.value))
                    }
                  />
                </label>
                <label className="quote-field">
                  <span>Unità</span>
                  <select
                    value={row.unit}
                    onChange={(e) => line(index, "unit", e.target.value)}
                  >
                    {units.map((unit) => (
                      <option key={unit}>{unit}</option>
                    ))}
                  </select>
                </label>
                <label className="quote-field">
                  <span>Prezzo unitario (€)</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.unitPrice}
                    onChange={(e) =>
                      line(index, "unitPrice", Number(e.target.value))
                    }
                  />
                </label>
                <label className="quote-field">
                  <span>IVA (%)</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={row.vat}
                    onChange={(e) => line(index, "vat", Number(e.target.value))}
                  />
                </label>
              </div>
              <div className="quote-line-footer">
                <span>
                  Imponibile:{" "}
                  <strong>{currency(totals.lines[index].gross)}</strong>
                </span>
                <button
                  type="button"
                  className="admin-remove"
                  aria-label={`Rimuovi lavorazione ${index + 1}`}
                  disabled={quote.lines.length === 1}
                  onClick={() =>
                    update(
                      "lines",
                      quote.lines.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Trash2 size={16} />
                  Rimuovi
                </button>
              </div>
            </fieldset>
          ))}
        </div>
        <button
          className="admin-secondary"
          disabled={quote.lines.length >= 100}
          onClick={() =>
            update("lines", [
              ...quote.lines,
              {
                id: crypto.randomUUID(),
                description: "",
                quantity: 1,
                unit: "a corpo",
                unitPrice: 0,
                vat: 0,
              },
            ])
          }
        >
          <Plus size={16} />
          Aggiungi lavorazione
        </button>
        <div className="quote-fields quote-conditions">
          {(
            [
              ["schedule", "Tempi e organizzazione dei lavori"],
              ["payment", "Condizioni di pagamento"],
              ["inclusions", "Cosa è incluso"],
              ["exclusions", "Esclusioni e opere da valutare separatamente"],
              ["notes", "Note e condizioni del preventivo"],
            ] as const
          ).map(([key, label]) => (
            <label className="quote-field wide" key={key}>
              <span>{label}</span>
              <textarea
                value={quote[key]}
                maxLength={key === "notes" ? 5000 : 3000}
                onChange={(e) => update(key, e.target.value)}
              />
            </label>
          ))}
        </div>
        <dl className="quote-totals">
          <div>
            <dt>Lavorazioni</dt>
            <dd>{currency(totals.gross)}</dd>
          </div>
          {totals.discount > 0 && (
            <div>
              <dt>Sconto ({quote.discount}%)</dt>
              <dd>−{currency(totals.discount)}</dd>
            </div>
          )}
          <div>
            <dt>Imponibile</dt>
            <dd>{currency(totals.net)}</dd>
          </div>
          <div>
            <dt>IVA</dt>
            <dd>{currency(totals.vat)}</dd>
          </div>
          <div className="quote-grand-total">
            <dt>Totale preventivo</dt>
            <dd>{currency(totals.total)}</dd>
          </div>
        </dl>
        {error && (
          <p className="quote-feedback error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="quote-feedback success" role="status">
            {message}
          </p>
        )}
        <div className="admin-save-actions">
          <button
            className="admin-secondary"
            disabled={busy}
            onClick={() => void save("draft")}
          >
            Salva bozza
          </button>
          <button
            className="button"
            disabled={busy}
            onClick={() => void save("ready")}
          >
            {busy ? "Salvataggio…" : "Segna come pronto"}
          </button>
          {record.quote && !dirty && (
            <a
              className="admin-secondary"
              href={`/admin/quotes/${record.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Stampa / salva PDF
            </a>
          )}
        </div>
        {dirty && (
          <p className="admin-editor-note">Modifiche non ancora salvate.</p>
        )}
      </div>
    </div>
  );
}
