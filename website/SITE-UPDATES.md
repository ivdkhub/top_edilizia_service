# Aggiornamenti Top Edilizia Service — 30 settembre 2026

## FAQ

`components/CompanyFAQ.tsx` riprende struttura e interazioni della pagina `src/app/faq/page.tsx` e del componente `src/components/ParallaxCard.tsx` nel progetto locale Beauty Dreamer. Il progetto originale è stato soltanto letto.

Card arrotondate, una risposta aperta alla volta, prima risposta aperta inizialmente, transizione altezza/opacità di 300 ms, ingresso progressivo e lieve inclinazione magnetica. Restano le quattro domande e le risposte pertinenti a Top Edilizia Service. Animazioni disattivate con preferenza di movimento ridotto. I pannelli chiusi sono esclusi dall'interazione; i pulsanti dichiarano lo stato di apertura.

## Portfolio

`components/ui/interactive-folder-gallery.tsx` integra la cartella animata richiesta, con Framer Motion 13.4.6. Il progetto era già configurato con TypeScript, Tailwind 4, alias `@` e struttura shadcn in `components/ui`; non era necessaria una nuova installazione del progetto.

Stack in hover, apertura a ventaglio, spring stiffness 350 / damping 30, chiusura trascinando una fotografia di oltre 100 px verso il basso. Pulsanti di ingrandimento, chiusura ed Escape rendono disponibili le azioni anche senza trascinamento. La distanza delle fotografie si adatta alla larghezza del contenitore; su mobile sono disponibili anche cinque selettori numerati.

La cartella usa cinque fotografie reali dalla galleria aziendale, agli indici 23, 53, 48, 62, 16 del dataset originale. Il pulsante «Tutte le foto (76)» mantiene l'intero archivio e il visualizzatore con navigazione. Nessun file sorgente è stato modificato o sostituito con immagini stock.

## Configuratore e riepilogo

Quattro passaggi: interventi, immobile, progetto e contatti. Oltre a servizio e ambito, vengono raccolti:

- tipo e stato dell'immobile, indirizzo, comune, CAP, superficie, piani e locali;
- lavorazioni, quantità, unità di misura e dettagli specifici;
- occupazione e vincoli di accesso, finiture, budget, inizio e scadenza;
- stato della progettazione e delle autorizzazioni, descrizione e collegamento facoltativo a documenti/foto;
- nominativo, email, telefono, azienda, codice fiscale/P.IVA facoltativi, note e consenso.

Il riepilogo usa colonne restringibili, valori con ritorno a capo e gestione delle parole lunghe. Su desktop è sticky e può scorrere internamente se lo schermo è basso; sotto 800 px segue normalmente il form senza limiti di altezza. Le misure sconosciute rimangono esplicitamente da verificare, senza stime di prezzi automatiche.

L'invio salva nel database D1, restituisce un riferimento TES e conserva i campi in caso di errore. Validazione server, limite di dimensione, origine della richiesta, honeypot, limite di frequenza e identificativo idempotente proteggono il flusso. I dati delle richieste non vengono salvati in localStorage.

## Area riservata e preventivi

Aprire `/admin`, anche dal link «Area riservata» nel footer. L'amministrazione può leggere le richieste, cercare tra quelle caricate, caricare le successive e aprire il dettaglio completo.

L'editor precompila le lavorazioni e le misure note; permette di aggiungere o rimuovere voci, modificare descrizioni, quantità, unità, prezzi e aliquote IVA, applicare uno sconto e indicare validità, tempi, pagamenti, inclusioni, esclusioni e condizioni. Prezzi e IVA devono essere scelti dall'amministrazione: non sono attribuiti automaticamente ai lavori.

Bozze e preventivi pronti sono persistenti. Le revisioni impediscono che un secondo salvataggio obsoleto sovrascriva modifiche di un'altra sessione. I calcoli usano centesimi interi e arrotondamenti coerenti. La pagina `/admin/quotes/[id]` offre il documento aziendale stampabile; «Stampa / salva PDF» apre la stampa del browser. Non è implementato l'invio automatico di email, né un caricamento diretto di allegati: il configuratore accetta un collegamento HTTP/HTTPS facoltativo.

L'autenticazione riusa Sign in with ChatGPT già presente nel progetto. In sviluppo su localhost è ammesso soltanto l'utente mock `local_seedy`. In produzione occorre configurare `ADMIN_USER_IDS` con gli identificativi autorizzati, separati da virgole: in assenza di questa configurazione l'accesso amministrativo è negato. Tutte le API di lettura e modifica dei preventivi applicano lo stesso controllo.

## Database e comandi locali

Il binding logico D1 `DB` è dichiarato in `.openai/hosting.json`. Le tabelle `quote_requests` e `quote_rate_limits` sono definite in `db/schema.ts`. La migrazione schema-only è `drizzle/0000_glamorous_mattie_franklin.sql`, applicata al database locale in `.wrangler/state`. Le route non eseguono migrazioni a runtime.

Eseguire dalla cartella `website`:

```powershell
& 'C:/Program Files/nodejs/node.exe' scripts/migrate-local.mjs
& 'C:/Program Files/nodejs/node.exe' scripts/run-framework.mjs dev
```

In un altro terminale:

```powershell
& 'C:/Program Files/nodejs/node.exe' node_modules/typescript/bin/tsc --noEmit
& 'C:/Program Files/nodejs/node.exe' scripts/test-quotes.mjs
& 'C:/Program Files/nodejs/node.exe' scripts/run-framework.mjs build
```

Il test API richiede il server locale già avviato, usa dati sintetici con email `.invalid` e rimuove soltanto il proprio record dopo il test. Non usa un database remoto. I corrispondenti script npm sono `db:migrate:local`, `typecheck`, `test:quotes`, `build`.

## Contatti e verifica

La card contatti è stata successivamente ricostruita prendendo spunto dall'immagine locale «Immagine ChatGPT 30 set 2026, 14_05_22.png»: composizione più orizzontale, titolo e spazi proporzionati, card bianca semitrasparente e pulsante scuro con riflesso. Le onde sono ora tracciati SVG decorativi con bordo curvo e movimento lieve, nei colori rgb(241, 93, 46), rgb(255, 152, 48) e rgb(251, 188, 156). Il layout dedicato è in `app/contact-card.css`; testo e contatti restano HTML e link funzionanti. Verificato a 942, 1440 e 390 px, senza fuoriuscite dalla card; con movimento ridotto le onde rimangono ferme.

Verifica nel browser a 1280 px, circa 1000 px e 390 × 844 px: nessuna fuoriuscita orizzontale del riepilogo, FAQ espandibili, apertura/chiusura tramite drag della cartella, selezione foto mobile e archivio completo. Verificati invio reale locale, salvataggio bozza/pronto, ricaricamento, editor mobile e documento stampabile. Test API: accesso anonimo e header di identità contraffatti negati, origine diversa negata, validazione, persistenza, idempotenza, IVA/arrotondamenti e conflitti di revisione.

Anteprime salvate nella cartella `.company-import` alla radice del workspace:

- `portfolio-folder-preview.png`
- `quote-configurator-preview.png`
- `faq-preview.png`
- `orange-contact-preview.png`
- `contact-reference-preview.png` (versione successiva ispirata all'immagine fornita)

Backup dei file preesistenti: `../backups/site-updates-20260930`. L'animazione cinematografica iniziale, le testimonianze e i video sorgente non sono stati modificati da questi aggiornamenti. Il lavoro è locale; non è stato pubblicato.

Backup aggiuntivo prima della nuova card contatti: `../backups/contact-card-20260930`, con `Consultation.tsx` e `globals.css`. Per ripristinare questa sola modifica, copiare i due file nei percorsi originali e rimuovere l'import del nuovo foglio di stile ripristinando il CSS precedente; il database non è interessato.

## Aggiornamento successivo: scena TV

Il video 10 è stato accodato all'introduzione. Il telecomando trasparente fornito sale dal bordo inferiore e alterna accensione e spegnimento del video 11; al nuovo scroll scende con la stessa animazione al contrario. Dettagli dei media, sincronizzazione, accessibilità e backup in `TV-ANIMATION.md`. I sorgenti restano invariati e il lavoro è locale.
## Card servizi · Focus Frame (30 settembre 2026)

Le quattro card di `components/Craft.tsx` usano `components/ui/shine-border-06.tsx`, adattato dal componente ufficiale Shadcn Space (licenza MIT conservata in `licenses/shadcnspace-MIT.txt`). Cornici da 40px, ciclo 2,4s, ritardi 0/0,3/0,6/0,9s e colore blu del demo. Card, CardContent e Badge riutilizzano i componenti UI esistenti. I testi aziendali e i link ai pannelli dei servizi sono conservati.

Gli stili in `app/services-cards.css` sono espliciti e circoscritti: le utility Tailwind del progetto sono limitate alla sezione testimonianze. Non occorrono nuove dipendenze. La griglia mantiene quattro colonne desktop, due tablet e una sotto 540px. Il movimento degli angoli rispetta prefers-reduced-motion.

Verifica: TypeScript e build completati; controllo browser desktop 1280x720 e mobile 390x844 senza overflow orizzontale; il link Restauro seleziona il relativo pannello. Anteprima: `visual-qa/services-shine-desktop.jpg`.

Backup precedente: `../backups/services-shine-20260930/`. Per ripristinare, copiare Craft.tsx e globals.css dal backup nelle rispettive directory; i nuovi file CSS/componente non importati possono restare senza effetti.

## Card servizi · Luminous Design (30 settembre 2026)

Le card Focus Frame sono sostituite dal componente React `components/ui/luminous-service-card.tsx` e dagli stili circoscritti `app/luminous-services.css`, adattati dal markup/CSS fornito dall'utente. Riprodotti fondo antracite radiale, cornice esterna agli angoli, SVG originale con identificatori univoci, fessura prospettica, tre strati luminosi, ombre e interruttore metallico. Ogni switch mantiene uno stato React indipendente e accessibile (aria-checked); il movimento rispetta prefers-reduced-motion. Le proporzioni 18:24 scalano con la larghezza della card tramite container units. Il font Inter già presente conserva la coerenza del sito.

Le card mostrano la prima frase del testo aziendale, mentre i collegamenti Scopri il servizio portano ai pannelli con i testi completi. Gli stili globali del demo (body scuro, altezza e overflow della pagina, font-size root) non vengono applicati alla pagina: il resto del sito mantiene il layout esistente. Nessuna nuova dipendenza.

Verifiche: TypeScript, build e test regressione scroll passati. Browser desktop 1280x720: nessun overflow, quattro card da 263x351px; prima e terza accese indipendentemente, lumen opacity 0,5, fessura bianca; altre spente, opacity 0 e fessura scura. Screenshot: visual-qa/services-luminous-desktop.jpg. Il controllo mobile live non è stato completato perché la modifica viewport del browser è andata in timeout; la griglia CSS prevede due colonne tablet e una sotto 540px.

Backup dello stato Focus Frame: ../backups/services-luminous-20260930/. Ripristino: copiare Craft.tsx e globals.css nelle rispettive directory. Il server locale è stato riavviato per risolvere una cache PostCSS che conservava l'errore iniziale del nuovo import prima della creazione del foglio CSS; URL invariato http://127.0.0.1:5173/.
