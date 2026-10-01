# Top Edilizia Service — sito web

Sito Next.js 16 (App Router) con modulo di richiesta preventivo e area riservata `/admin` per gestire le richieste e preparare i preventivi. Database: [Turso](https://turso.tech) (libSQL/SQLite). Hosting: Vercel.

## Sviluppo locale

Requisiti: Node.js ≥ 22.13.

```bash
npm install
cp .env.example .env.local   # imposta almeno ADMIN_PASSWORD
npm run db:migrate           # senza TURSO_DATABASE_URL crea .data/local.db
npm run dev                  # http://localhost:3000
```

Area riservata: `http://localhost:3000/admin` (password = `ADMIN_PASSWORD`).

Altri comandi: `npm run build`, `npm run typecheck`, `npm run lint`, `npm run test:quotes` (test API; richiede il server avviato e `ADMIN_PASSWORD`).

## Variabili d'ambiente

| Variabile | Descrizione |
| --- | --- |
| `TURSO_DATABASE_URL` | URL del database, es. `libsql://top-edilizia-<utente>.turso.io`. Obbligatoria in produzione. |
| `TURSO_AUTH_TOKEN` | Token del database Turso. |
| `ADMIN_PASSWORD` | Password dell'area `/admin`. |
| `ADMIN_SESSION_SECRET` | Stringa casuale ≥ 32 caratteri per firmare il cookie di sessione (`openssl rand -hex 32`). |

## Deploy su Vercel

1. **Database Turso** (piano gratuito): crea un database in regione Europa, poi genera URL e token
   (`turso db create top-edilizia --location fra` · `turso db show top-edilizia --url` · `turso db tokens create top-edilizia`),
   oppure aggiungi l'integrazione Turso dal Marketplace di Vercel.
2. **Schema**: dalla cartella `website`, con le variabili Turso in `.env.local`, esegui `npm run db:migrate`.
3. **Vercel → Add New → Project** → importa il repository GitHub e imposta **Root Directory = `website`** (il framework Next.js viene rilevato automaticamente).
4. Inserisci le quattro variabili d'ambiente qui sopra in *Settings → Environment Variables* e avvia il deploy.

Le funzioni girano in `fra1` (Francoforte, vedi `vercel.json`): conviene creare il database Turso nella stessa area.

## Struttura

- `app/` — pagine, API (`app/api/quote-requests`, `app/api/admin`) e stili
- `components/` — sezioni del sito e area admin
- `content/`, `lib/company.ts` — contenuti aziendali
- `db/` — client Turso e schema Drizzle; `drizzle/` — migrazioni SQL
- `public/media` — video e immagini ottimizzati usati dal sito
- `tools/` — script Python usati per ottimizzare i video
- I file `*.md` in questa cartella documentano le scelte di animazione e grafica.
