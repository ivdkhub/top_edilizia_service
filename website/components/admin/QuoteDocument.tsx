"use client";
import { company } from "../../lib/company";
import {
  currency,
  quoteTotals,
  type SavedRequest,
} from "../../lib/quote-config";
export default function QuoteDocument({ record }: { record: SavedRequest }) {
  const quote = record.quote!;
  const r = record.request;
  const totals = quoteTotals(quote);
  const expires = new Date(`${quote.date}T12:00:00`);
  expires.setDate(expires.getDate() + quote.validityDays);
  return (
    <main className="quote-document-shell">
      <div className="quote-print-toolbar">
        <a href="/admin">Torna all’admin</a>
        <button className="button" onClick={() => window.print()}>
          Stampa / salva come PDF
        </button>
      </div>
      <article className="quote-document">
        <header className="document-header">
          <div>
            <img
              src="/media/logo.png"
              alt={company.name}
              width={90}
              height={84}
            />
            <strong>{company.name}</strong>
            <p>
              {company.address}
              <br />
              P.IVA {company.vat}
              <br />
              {company.email} · {company.phone}
            </p>
          </div>
          <div>
            <h1>Preventivo</h1>
            <p>
              <strong>{quote.reference}</strong>
              <br />
              Data:{" "}
              {new Date(`${quote.date}T12:00:00`).toLocaleDateString("it-IT")}
              <br />
              Valido fino al {expires.toLocaleDateString("it-IT")}
            </p>
            {quote.status === "draft" && (
              <strong className="document-draft">BOZZA</strong>
            )}
          </div>
        </header>
        <section className="document-recipient">
          <h2>Cliente</h2>
          <strong>{r.company || r.name}</strong>
          {r.company && <p>{r.name}</p>}
          <p>
            {r.email} · {r.phone}
          </p>
          {r.taxId && <p>CF / P.IVA: {r.taxId}</p>}
          <p>
            Immobile: {r.address}, {r.postalCode} {r.city}
          </p>
        </section>
        <section>
          <h2>Oggetto dell’intervento</h2>
          <p className="admin-long-text">{r.description}</p>
        </section>
        <div className="document-table-wrap">
          <table className="document-table">
            <thead>
              <tr>
                <th>Lavorazione</th>
                <th>Quantità</th>
                <th>Prezzo unit.</th>
                <th>IVA</th>
                <th>Imponibile</th>
              </tr>
            </thead>
            <tbody>
              {quote.lines.map((line, index) => (
                <tr key={line.id}>
                  <td>{line.description}</td>
                  <td>
                    {line.quantity.toLocaleString("it-IT")} {line.unit}
                  </td>
                  <td>{currency(Math.round(line.unitPrice * 100))}</td>
                  <td>{line.vat}%</td>
                  <td>{currency(totals.lines[index].gross)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <dt>Imponibile netto</dt>
            <dd>{currency(totals.net)}</dd>
          </div>
          <div>
            <dt>IVA</dt>
            <dd>{currency(totals.vat)}</dd>
          </div>
          <div className="quote-grand-total">
            <dt>Totale</dt>
            <dd>{currency(totals.total)}</dd>
          </div>
        </dl>
        {(
          [
            ["schedule", "Tempi e organizzazione"],
            ["payment", "Condizioni di pagamento"],
            ["inclusions", "Inclusioni"],
            ["exclusions", "Esclusioni"],
            ["notes", "Note e condizioni"],
          ] as const
        ).map(
          ([key, title]) =>
            quote[key] && (
              <section className="document-conditions" key={key}>
                <h2>{title}</h2>
                <p className="admin-long-text">{quote[key]}</p>
              </section>
            ),
        )}
        <footer className="document-footer">
          {company.name} · {company.email} · {company.phone}
          <br />
          Richiesta TES-{record.id.slice(0, 8).toUpperCase()}
        </footer>
      </article>
    </main>
  );
}
