# Raccordi cinematografici e ottimizzazione dello scroll

## Problemi individuati

I nove sorgenti H.264 sono a 24 fps e contengono un solo fotogramma chiave all'inizio di ciascun file. I salti avanti e indietro richiedevano quindi di decodificare una lunga porzione del filmato. La prova precedente quantizzava erroneamente a 30 fps. Il cambio scena era immediato, senza verificare che il nuovo fotogramma fosse stato presentato; il precaricamento preparava solo la scena successiva.

## Nuova versione

- `public/media/scroll/1.mp4` … `9.mp4`: copie derivate H.264, CRF 18, GOP massimo di sei fotogrammi (0.25 secondi), senza B-frame e con indice MP4 all'inizio (`faststart`). Nessun ritaglio, ridimensionamento, cambio di durata o modifica della sequenza delle immagini. I sorgenti sono intatti; la compressione delle copie non è lossless. Sono copie per gli sfondi muti della pagina.
- Peso complessivo: 134.81 MB originali → 101.40 MB copie, riduzione del 24.78%.
- `lib/scroll-scenes.ts`: fotogrammi quantizzati a 24 fps, massimo un seek in corso per clip, richieste limitate alla frequenza reale dei filmati e obiettivi obsoleti scartati. Il caricamento prepara entrambe le scene adiacenti. Il controllo del nuovo fotogramma usa [`requestVideoFrameCallback`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback), con fallback agli eventi media.
- Composizione: dissolvenza sulle due scene intorno a ciascun raccordo, su una fascia pari al 18% della distanza di una clip. L'interpolazione delle opacità accompagna anche i salti rapidi. I pesi sono composti senza oscuramento accidentale a metà dissolvenza.
- Sfocatura massima di 1.6 px applicata solo alla superficie video. Testi e navigazione rimangono nitidi. Quando il movimento si ferma, la messa a fuoco si ripristina entro 370 ms dall'ultimo aggiornamento della progressione.
- Clock unico GSAP per lo scroll, le animazioni e il controller dei video; nessun render React durante lo scroll. Gli stili vengono scritti solo quando cambiano. Le scene lontane vengono scaricate dopo una breve attesa per evitare ricaricamenti nelle inversioni vicino al raccordo. A riposo vengono mantenute fino a tre clip; durante un salto rapido la clip in uscita resta pronta finché la dissolvenza termina.
- Sequenza, testo, ritaglio nel viewport, distanza totale di 6.5 viewport e smorzamento dello scroll rimangono quelli della prova approvata. La modalità movimento ridotto usa i poster statici.
- La progressione GSAP usa valori iniziali e finali espliciti, così il ricalcolo di ScrollTrigger non ricava l'inizio dal fotogramma raggiunto durante lo scroll.

Le opzioni di codifica seguono la [documentazione FFmpeg/libx264](https://ffmpeg.org/ffmpeg-codecs.html#libx264).

## Verifiche

- TypeScript e build di produzione completati.
- Tutti gli otto raccordi verificati nel browser a 1280 × 720: due scene pronte, sfocatura azzerata a riposo e due/tre sorgenti caricati a riposo.
- Scroll inverso e inversioni rapide tra più filmati: raggiunto il fotogramma corrispondente alla posizione finale; nessun errore console nella scheda di verifica.
- Passaggio osservato anche a 1166 × 1004: filtro massimo osservato di 1.57 px; testo nitido durante il passaggio.
- Anteprima mobile 390 × 844: primo raccordo, ritorno a Home e assenza di overflow orizzontale verificati; dimensioni del browser ripristinate al termine.
- HTTP 206 con richieste Range per i video ottimizzati.
- SHA-256 di tutti i sorgenti verificati invariati. Copie con identici risoluzione, durata, numero di fotogrammi e frame rate.
- Confronto SSIM su tutti i 921 fotogrammi: risultati per clip compresi fra 0.987218 e 0.995294. Questo confronto verifica la vicinanza visiva delle copie compresse, non la fluidità dello scroll.

Manifest: `content/scroll-media-manifest.json`. Strumenti riproducibili: `tools/optimize_scroll_media.py` e `tools/validate_scroll_media.py`. Risultati del browser e del confronto nella directory superiore `.reference-analysis/`: `junction-browser-qa.json` e `scroll-media-quality.json`.

La verifica non costituisce una misura del frame rate del browser. La maggiore densità di fotogrammi chiave riduce il lavoro di seek; hardware, rete e velocità dello scroll continuano a influire sulla fluidità percepita. I sorgenti restano a 24 fps.

## Backup e ripristino

Backup immediatamente precedente a queste modifiche: `../backups/junctions-20260930-112311`, con manifest SHA-256. Il primo backup, prima dell'introduzione dello scroll smorzato, rimane in `../backups/animation-20260930-094755`.

Per tornare alla precedente prova dello scroll smorzato, copiare i quattro file del nuovo backup nelle rispettive posizioni in `website/` e riavviare il server. `lib/scroll-scenes.ts` e i video derivati in `public/media/scroll/` non saranno più referenziati; possono essere conservati oppure rimossi. I video sorgenti non richiedono ripristino.
