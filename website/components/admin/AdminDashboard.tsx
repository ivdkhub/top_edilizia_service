"use client";
import { useEffect, useState } from "react";
import { company, services } from "../../lib/company";
import { serviceIds, type SavedRequest } from "../../lib/quote-config";
import QuoteEditor from "./QuoteEditor";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
const labels: Record<string, string> = {
  new: "Nuova",
  review: "In lavorazione",
  quoted: "Preventivo pronto",
};
export default function AdminDashboard() {
  const [requests, setRequests] = useState<SavedRequest[]>([]),
    [selected, setSelected] = useState<SavedRequest | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState<string | null>(null),
    [stats, setStats] = useState({ total: 0, newCount: 0, quoted: 0 }),
    [dirty, setDirty] = useState(false),
    [discard, setDiscard] = useState(false);
  async function load(next?: string) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/quote-requests${next ? `?cursor=${encodeURIComponent(next)}` : ""}`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as {
        error?: string;
        requests: SavedRequest[];
        nextCursor: string | null;
        stats: typeof stats;
      };
      if (!response.ok) throw new Error(data.error);
      setRequests((previous) =>
        next
          ? [
              ...previous,
              ...data.requests.filter(
                (r) => !previous.some((p) => p.id === r.id),
              ),
            ]
          : data.requests,
      );
      setCursor(data.nextCursor);
      setStats(data.stats);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Caricamento non riuscito.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  const visible = requests.filter((r) =>
    `${r.request.name} ${r.request.city} ${r.id} ${r.request.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <a href="/" className="admin-brand">
            <img
              src="/media/logo.png"
              alt={company.name}
              width={64}
              height={60}
            />
          </a>
          <p>Area riservata</p>
        </div>
        <div>
          <a href="/">Torna al sito</a>
          <form method="post" action="/api/admin/logout">
            <button type="submit" className="admin-logout">
              Esci
            </button>
          </form>
        </div>
      </header>
      <div className="admin-title">
        <div>
          <p className="eyebrow">Richieste e preventivi</p>
          <h1>
            {selected
              ? `Progetto di ${selected.request.name}`
              : "I progetti da costruire"}
          </h1>
        </div>
        {selected ? (
          <button
            className="admin-secondary"
            onClick={() => (dirty ? setDiscard(true) : setSelected(null))}
          >
            Tutte le richieste
          </button>
        ) : (
          <button className="admin-secondary" onClick={() => void load()}>
            Aggiorna
          </button>
        )}
      </div>
      {selected ? (
        <QuoteEditor
          record={selected}
          onDirtyChange={setDirty}
          onSaved={(record) => {
            setStats((previous) => ({
              ...previous,
              newCount:
                (previous.newCount || 0) +
                Number(record.status === "new") -
                Number(selected.status === "new"),
              quoted:
                (previous.quoted || 0) +
                Number(record.status === "quoted") -
                Number(selected.status === "quoted"),
            }));
            setSelected(record);
            setRequests((previous) =>
              previous.map((r) => (r.id === record.id ? record : r)),
            );
          }}
        />
      ) : (
        <>
          <div className="admin-stats">
            <div>
              <strong>{stats.total}</strong>
              <span>Richieste ricevute</span>
            </div>
            <div>
              <strong>{stats.newCount || 0}</strong>
              <span>Da valutare</span>
            </div>
            <div>
              <strong>{stats.quoted || 0}</strong>
              <span>Preventivi pronti</span>
            </div>
          </div>
          <label className="quote-field admin-search">
            <span>
              Cerca cliente, comune o riferimento tra le richieste caricate
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
            />
          </label>
          {loading && <p role="status">Caricamento delle richieste…</p>}
          {error && (
            <p className="quote-feedback error" role="alert">
              {error}
            </p>
          )}
          {!loading && !error && (
            <div className="admin-request-list">
              {visible.length ? (
                visible.map((record) => (
                  <button
                    className="admin-request"
                    key={record.id}
                    onClick={() => setSelected(record)}
                  >
                    <span className="request-status">
                      {labels[record.status]}
                    </span>
                    <strong>{record.request.name}</strong>
                    <span>
                      {
                        services[serviceIds.indexOf(record.request.service)]
                          .title
                      }{" "}
                      · {record.request.city}
                    </span>
                    <small>
                      {new Date(record.createdAt).toLocaleDateString("it-IT")} ·
                      TES-{record.id.slice(0, 8).toUpperCase()}
                    </small>
                    <span className="request-open">Apri richiesta</span>
                  </button>
                ))
              ) : (
                <div className="admin-empty">
                  <h2>
                    {search ? "Nessun risultato" : "Nessuna richiesta ricevuta"}
                  </h2>
                  <p>
                    {search
                      ? "Prova con un altro nome o comune."
                      : "Le richieste inviate dal configuratore saranno disponibili qui."}
                  </p>
                </div>
              )}
            </div>
          )}
          {cursor && (
            <button
              className="admin-secondary"
              disabled={loading}
              onClick={() => void load(cursor)}
            >
              Carica altre richieste
            </button>
          )}
        </>
      )}
      <Dialog open={discard} onOpenChange={setDiscard}>
        <DialogContent className="testimonial-dialog" showCloseButton={false}>
          <DialogTitle asChild>
            <h2>Modifiche non salvate</h2>
          </DialogTitle>
          <DialogDescription>
            Se torni all’elenco, le modifiche a questo preventivo andranno
            perse.
          </DialogDescription>
          <div className="admin-save-actions">
            <button className="button" onClick={() => setDiscard(false)}>
              Continua a modificare
            </button>
            <button
              className="admin-secondary"
              onClick={() => {
                setDiscard(false);
                setSelected(null);
                setDirty(false);
              }}
            >
              Esci senza salvare
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
