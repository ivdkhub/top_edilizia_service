# Testimonianze: schede animate

La sezione `Stories` usa lo stack React fornito, collegato al progresso dello scroll. Le quattro recensioni e i filtri provengono dai dati aziendali già importati. La lettura estesa si apre in una finestra Radix accessibile, con blocco dello scroll della pagina e ripristino alla chiusura.

## File e struttura

- `components/ui/animated-cards-stack.tsx`: `ContainerScroll`, `CardsContainer`, `CardTransformed`, `ReviewStars`.
- `components/ui/avatar.tsx`: componente shadcn esistente, ora collegato alla dipendenza Radix dedicata.
- `components/Stories.tsx`: integrazione con le recensioni reali, filtri e finestra di lettura.
- `app/testimonial-utilities.css`: utility Tailwind e token cromatici per questa sezione.
- `app/testimonials.css`: composizione, dimensioni, responsive e alternativa senza movimento.
- `app/globals.css`: importa i due fogli di stile della sezione.
- `lib/company.ts` e `content/company.json`: dati aziendali esistenti, non modificati.

Il progetto dispone già di TypeScript, alias `@/`, configurazione shadcn `components.json`, cartella `components/ui` e Tailwind 4 con PostCSS. Non serve inizializzare un nuovo progetto o eseguire la CLI shadcn. `components/ui` mantiene coerenti gli import e separa le primitive riutilizzabili dai componenti delle sezioni.

## Dipendenze

Installati `motion` e `@radix-ui/react-avatar`. `class-variance-authority`, `lucide-react` e le altre primitive Radix erano già presenti. Il tema attuale non richiede un nuovo provider `next-themes`.

La sintassi Tailwind 3 del blocco CSS fornito è stata adattata al compilatore Tailwind 4 già configurato. Le utility sono limitate a `.stories` e la palette usa variabili dedicate: nessun nuovo reset globale o cambio di stile nelle altre sezioni.

## Animazione e dati

- Altezza di scorrimento `300vh`, composizione sticky sotto l’header.
- Traslazione verticale, rotazione, profondità e ombra dipendono dal progresso dello scroll, secondo il componente fornito.
- Nessun aggiornamento dello stato React a ogni evento di scroll: i valori animati restano MotionValue.
- Rimossi il layout tween superfluo e la chiamata condizionale a un hook del frammento originale.
- Dimensioni desktop `350 × 450px`; smartphone fino a `300 × 420px`.
- Con `prefers-reduced-motion`, le recensioni diventano una griglia statica leggibile.
- Le recensioni importate non includono valutazioni numeriche verificate o fotografie dei clienti. Sono mantenute le iniziali; non sono introdotti voti, ritratti stock o nomi del demo. `ReviewStars` resta disponibile per eventuali dati confermati.
- Alcune citazioni estese contengono già `[...]` nei dati importati: non è stato inventato il testo omesso.

Le varianti demo Awards/Images non sono aggiunte: la modifica riguarda la sezione testimonianze richiesta.

## Verifica

TypeScript e build di produzione completati. Controllo nel browser a desktop e `390 × 844px`: successione delle quattro schede, filtri, contenuto della finestra, chiusura e ripresa dello scroll. Nessun allargamento orizzontale della pagina nello stack mobile.

## Backup

Versione precedente in `../backups/testimonials-20260930-115725`. Il backup conserva i file modificati preesistenti e i manifest delle dipendenze; non duplica video o immagini.
