# Sequenza finale e telecomando

La sequenza iniziale comprende i filmati 1–10. Il filmato 10 prosegue il movimento verso il televisore mantenendo il passo delle nove scene precedenti: 7,22 altezze di viewport complessive, seguite da 1,15 altezze sulla scena finale. Il telecomando compare solo quando il decoder ha presentato l'ultimo fotogramma della scena 10.

## Media

- `public/media/scroll/10.mp4`: copia di distribuzione con keyframe ravvicinati per la ricerca durante lo scroll, stessa risoluzione, durata e contenuto del sorgente.
- `public/media/11.mp4`: copia identica del sorgente 11, riprodotta normalmente all'accensione.
- `public/media/tv/11-reverse.mp4`: tutti i 73 fotogrammi del sorgente 11 in ordine inverso, senza modificare il sorgente; la riproduzione nativa evita ricerche ripetute all'indietro.
- `public/media/telecomando.png`: copia identica dell'immagine fornita, già trasparente. Il CSS elimina solo il margine laterale trasparente nella presentazione, preservando le proporzioni del telecomando.
- `public/media/telecomando-top.png`: nuova immagine con logo aziendale fornita il 30 settembre, copia identica e già trasparente; sostituisce la precedente nella pagina.
- Poster in `public/media`: `10-poster.jpg`, `10-final.jpg`, `11-on.jpg`.

I file sorgente nella radice e l'immagine originale in Downloads sono invariati; i manifest in `content` registrano hash e parametri dei video. Il reverse è stato confrontato con tutti i fotogrammi originali in ordine inverso (errore medio dei canali 0,561 su 255 dovuto alla compressione).

Per ricreare le copie di distribuzione da `website`, con Python dotato di PyAV, Pillow e imageio-ffmpeg:

```powershell
& 'C:/Users/ivdk/AppData/Local/Programs/Python/Python313/python.exe' tools/prepare_tv_media.py
```

## Interazione e ciclo di vita

`Hero.tsx` gestisce lo scroll e la pausa finale; `lib/scroll-scenes.ts` mantiene dissolvenza e lieve offuscamento esistenti. Il valore ripristinato da GSAP durante un refresh viene sincronizzato con i decoder anche quando non viene eseguito `onUpdate`.

`Television.tsx` conserva il fotogramma visibile finché la nuova traccia è decodificata. Un click durante l'accensione o lo spegnimento inverte il movimento dal punto raggiunto, usando la corrispondenza temporale tra le due tracce. Richieste precedenti vengono invalidate senza bloccare nuovi click. I video sono caricati soltanto nella scena TV e rilasciati quando si ritorna alle scene precedenti o quando il viewport della TV è completamente uscito.

`RemoteControl.tsx` usa una timeline GSAP di 0,8 secondi per salire dal bordo inferiore. Il successivo input di scroll (rotella, touch o tastiera) esegue la stessa timeline al contrario. L'inerzia residua di Lenis non viene interpretata come nuovo input. Il telecomando nascosto non intercetta click e non rimane nel percorso di tabulazione. Enter e spazio attivano il pulsante; il nome accessibile indica Accendi TV o Spegni la TV. Con movimento ridotto il passaggio del telecomando è immediato.

Il successivo aggiornamento aggiunge un punto di arresto nel controller dello scroll: anche un input molto ampio viene fermato all'inizio della scena TV. Lenis viene arrestato e la sua destinazione animata azzerata. Rotella, touch e tasti di scorrimento sono scartati durante l'entrata e per 2.000 ms dopo il completamento dell'entrata. Non si accumulano input o richieste di navigazione da eseguire alla scadenza. I click TV rimangono funzionanti. Un limite di emergenza di 15 secondi evita un blocco permanente in caso di media non disponibile; pulizia del componente e del checkpoint rilasciano sempre il blocco.

Il telecomando riusa `ParallaxCard` delle FAQ: stessa prospettiva di 1.000 px, inclinazione e spostamento di 4, stessa molla (stiffness 200, damping 28). La variante senza rivelazione aggiuntiva evita di sovrapporre un'altra entrata alla timeline GSAP. FAQ e impostazioni per movimento ridotto conservano il comportamento esistente.

Le dimensioni si adattano al viewport senza coprire lo schermo della TV. Non sono state aggiunte dipendenze.

## Backup

`../backups/tv-animation-20260930` conserva l'hero e il controller precedenti alla scena 10, oltre alla prima variante con pulsante TV. Il relativo README descrive i ripristini separati. Il database dei preventivi non è interessato.

Il lavoro rimane locale e non è stato pubblicato.

## Verifica

Controllati nel browser desktop 1280 × 720 e mobile 390 × 844: scena 10 completa, telecomando visibile solo a fotogramma pronto, accensione/spegnimento, inversione con click ravvicinati, uscita al successivo scroll, ritorno alle scene precedenti e ricarica con scroll ripristinato. Quando la TV esce completamente dal viewport, entrambe le sorgenti vengono rimosse e i decoder rilasciati. Nessuna fuoriuscita orizzontale nel layout mobile; nessun errore console durante la verifica.

TypeScript e build di produzione completati. Le anteprime sono `visual-qa/tv-remote-desktop.jpg` e `visual-qa/tv-remote-mobile.jpg`. La fluidità è stata verificata visivamente; non è stata misurata una soglia FPS su dispositivi diversi.

Verifica aggiuntiva del blocco: input di 50 pagine arrestato a scrollY 5.236 sul desktop, ulteriore input di 10 pagine scartato durante il blocco, stessa posizione alla scadenza senza nuovi input. Un nuovo input ha portato scrollY a 5.386 e ritirato il telecomando. Verificati inclinazione parallax e click di accensione. Anteprima aggiornata: `visual-qa/tv-remote-top-desktop.jpg`. Backup prima di questo aggiornamento: `../backups/tv-remote-hold-20260930`.

Verificati anche PageDown scartato a scrollY 5.236, click TV consentito durante il blocco, ritorno alla home e navigazione diretta ai contatti senza attivare il checkpoint. Il test aggiuntivo è stato eseguito nel viewport desktop: il comando di ridimensionamento del browser per una nuova prova mobile non ha risposto, senza applicare l'override. Le dimensioni responsive del telecomando restano quelle già verificate nella precedente versione.

## Correzione dello scroll dopo il telecomando (30 settembre 2026)

Il checkpoint poteva riarmarsi durante un rapido cambio di direzione mentre il telecomando era già dismissed: veniva avviata una nuova pausa senza una nuova entrata capace di sbloccarla. Il checkpoint ora riceve lo stato di dismissal immediatamente sul gesto, non cattura lo scroll finché il telecomando non può tornare, e libera la pausa all'uscita. I callback tardivi non programmano timer se la pausa è già terminata. Il driver Lenis riavvia uno stato stopped privo di una pausa TV o di un modal aperto.

La pausa prevista resta di 2 secondi dopo il completamento dell'entrata; i gesti durante l'attesa vengono scartati. Test deterministici: `node scripts/test-scroll-hold.mjs` (pausa, rapido su/giù dopo dismissal, ritorno volontario, callback tardivi e fallback media). TypeScript e build passati. Browser desktop: checkpoint a 5236px, sblocco senza scroll accodato, remote nascosto e avanzamento a 7476px; rapido su/giù con remote nascosto senza nuova pausa. Backup: `../backups/tv-scroll-unlock-20260930/`.
