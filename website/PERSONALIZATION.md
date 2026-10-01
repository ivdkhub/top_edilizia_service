# Personalizzazione Top Edilizia Service

Importazione effettuata il 30 settembre 2026 dal sito pubblico https://topediliziaservice.com/.

## Materiale recuperato

- 10 pagine aziendali distinte: home, Chi Siamo, Servizi, i quattro approfondimenti dei servizi, galleria, contatti e privacy. Gli URL alternativi recuperati sono registrati nell’archivio delle fonti.
- 94 immagini originali, 31.573.442 byte complessivi, conservate senza ricodifica o modifica in `public/company/`. Escluse le copie responsive della stessa immagine: vengono mantenuti gli originali disponibili.
- 76 fotografie dalla galleria lavori, tutte consultabili sul nuovo sito; sei immagini costituiscono l’anteprima nel portfolio a scorrimento.
- Quattro servizi: Ristrutturazioni, Restauro edifici, Costruzioni edili, Costruzioni ex novo. Descrizioni brevi ricavate dai servizi; testi completi delle quattro pagine disponibili nei dialoghi di approfondimento.
- Presentazione aziendale, filosofia, missione, valori, ambiti operativi, punti di forza e quattro FAQ.
- Quattro recensioni pubblicate: Giorgia M., Orazio N., Zareta H., Annamaria S. Le omissioni `[...]` già presenti nella fonte sono conservate. Non sono stati inventati punteggi, località o abbinamenti recensione/foto.
- Telefono, cellulare, email, sede di Via Marconi 40 a Saronno, orari, P.IVA e profili social della versione corrente del sito.

## Dove aggiornare i contenuti

- `content/company.json`: servizi, testimonianze e galleria fotografica.
- `lib/company.ts`: contatti e collegamenti aziendali centralizzati.
- `content/asset-manifest.json`: URL originali, pagine di provenienza, dimensioni, peso e SHA-256 di ogni immagine.
- `content/source-pages.json`: archivio dei testi estratti dalle pagine pubbliche, inclusi i contenuti non necessari alla composizione della home.
- `.company-import/`, nella directory superiore: HTML originali, CSS recuperati, elenco URL e foglio di contatto fotografico utilizzati per l’importazione.

## Criteri e limiti

La composizione cinematografica, i video forniti, il logo scelto dall’utente e le animazioni GSAP rimangono quelli della ricostruzione. Il nuovo sito usa contenuti italiani riferiti all’impresa. Le immagini esterne sono ora locali: la pagina non dipende dal sito WordPress per caricarle.

Le foto della galleria non riportano schede progetto complete: non sono stati inventati nomi di clienti, indirizzi, date o specifiche. Le categorie generali derivano dai nomi dei file e dal contesto della galleria. I primi video e il confronto prima/dopo rimangono i media forniti dall’utente, senza attribuirli a un progetto identificato del portfolio importato.

La home sorgente presenta alcuni testi dei servizi sotto titoli non coerenti. Le descrizioni del nuovo sito seguono i rispettivi approfondimenti e le FAQ, evitando di trasferire questo errore. I contatori inizialmente a zero del sito sorgente non sono stati interpretati come valori effettivi: si mostrano 25 anni dichiarati nella fonte, quattro servizi e tre ambiti operativi.

Il vecchio calcolatore di prezzi in dollari e le garanzie sulle piscine sono stati sostituiti da una richiesta su misura. Il pulsante prepara un’email con le selezioni e apre il programma di posta dell’utente; non simula un invio e non usa un backend non fornito. Privacy Policy collega la pagina aziendale esistente; script WordPress, tracciamenti e banner tecnici del sito sorgente non vengono copiati.

## Verifiche

- Controllo TypeScript e build di produzione completati.
- Anteprima locale HTTP 200, lingua italiana e metadati aggiornati.
- Tutti i 94 file validati come immagini; manifest con hash SHA-256.
- Browser desktop: layout iniziale, Chi Siamo, portfolio e richiesta preventivo verificati; nessuna immagine rotta e nessun errore console nella scheda di verifica.
- Archivio: 76 foto presenti; apertura, foto successiva, ritorno all’archivio e chiusura funzionanti.
- Collegamento al servizio dal footer attiva il pannello corretto; approfondimento Restauro mostra il testo completo con dieci paragrafi.
- Richiesta email verificata con Costruzioni ex novo / Industriale / Tetti e coperture: destinatario e riepilogo corretti, nessun messaggio inviato durante il test.
- Mobile 390 × 844: menu e contatti verificati, nessun overflow orizzontale del documento. Dialogo fotografico largo 350 px, zero overflow interno, 76 foto.
- Filtro Professionalità mostra due recensioni; Tutte ripristina quattro. Le quattro schede scorrono orizzontalmente per mantenere la composizione iniziale.
- Apertura dei dettagli aggiorna ScrollTrigger per mantenere coerenti le posizioni delle sezioni.

- Anteprima di sviluppo: corretto il modulo Vinext dei deployment flag eseguito nel browser; ricaricamento automatico verificato senza nuovi errori dopo il riavvio. Build finale completata.

