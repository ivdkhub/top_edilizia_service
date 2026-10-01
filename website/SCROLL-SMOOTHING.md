# Prova di scorrimento più fluido — 30 settembre 2026

Il backup precedente alle modifiche si trova in `../backups/animation-20260930-094755`. Contiene i componenti dell'animazione, gli stili, la configurazione e i file delle dipendenze. I dieci file copiati sono stati verificati con gli SHA-256 del manifest. I video originali non sono stati modificati o duplicati.

## Modifiche

- `lib/smooth-scroll.ts`: Lenis 1.3.26 gestisce la rotella con `wheelMultiplier: 0.7` e `lerp: 0.1`, sincronizzato al ticker GSAP. Il movimento rallenta progressivamente quando l'input si interrompe. Nessun aggiornamento React durante lo scroll.
- `components/Hero.tsx`: `scrub` da 0.16 a 0.32 secondi. La prova iniziale usava una quantizzazione a 30 fps: l'analisi successiva dei file ha rilevato 24 fps. Il valore è stato corretto nell'ottimizzazione descritta in `CINEMATIC-TRANSITIONS.md`. Rimangono nove clip e una distanza di scroll di 6.5 viewport.
- `components/Experience.tsx`: i collegamenti alle sezioni usano lo stesso sistema di scroll, con durata di 0.85 secondi. I link da un dialogo attendono lo sblocco dello sfondo.
- `app/globals.css`: import degli stili ufficiali Lenis.

Il touch mantiene lo scorrimento nativo. La preferenza di movimento ridotto è rispettata. I dialoghi sospendono lo scroll dello sfondo e mantengono il proprio scroll interno. Observer, ticker e listener vengono rimossi allo smontaggio.

Integrazione basata sulla [documentazione ufficiale Lenis](https://github.com/darkroomengineering/lenis).

## Verifiche

- TypeScript e build di produzione.
- Browser desktop 1280 × 720: impulsi consecutivi della rotella, arresto e inversione; il video raggiunge il fotogramma finale e il sistema torna allo stato di riposo.
- Navigazione a Progetti e Contatti, ritorno a Home.
- Archivio fotografico: scroll interno di 504 px, posizione dello sfondo invariata, ripresa alla chiusura.
- Collegamento dal dettaglio fotografico ai contatti: dialogo chiuso, destinazione allineata sotto l'header.
- Nessun errore console nella scheda di verifica.

Questa verifica funzionale non misura il frame rate. La fluidità percepita dei video dipende anche dalla decodifica dei file sorgente e dall'hardware; non è stata eseguita alcuna ricodifica.

## Ripristino

Copiare i file del backup nelle corrispondenti posizioni di `website/`, sovrascrivendo questa prova. Ripristinare anche `package.json` e `package-lock.json`, quindi eseguire `npm ci` per rimuovere Lenis. Il file nuovo `lib/smooth-scroll.ts` può essere rimosso: il componente Experience del backup non lo importa. Riavviare il server di sviluppo.
