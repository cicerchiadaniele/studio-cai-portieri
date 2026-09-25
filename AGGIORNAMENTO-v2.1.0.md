# Registro Presenze Portieri — v2.1.0 (25/09/2026)

## Cosa cambia
Solo la veste grafica, ora uguale alle altre webapp dello studio (Segnalazioni rev 2.0, Portale interventi, Registro chiavi). La logica di invio non cambia.

- **Testata**: barra bianca fissa in alto, logo nel riquadro bianco con lo scudetto bordeaux, "Studio CAI" con la versione e sottotitolo "Presenze portieri"; stato Online a destra.
- **Sfondo**: carta #fbf8f4 con velature bordeaux e grana leggera, come negli altri portali.
- **Scheda**: fascia del titolo bordeaux sfumata ("Nuova richiesta", prima diceva erroneamente "Nuova segnalazione").
- **Campi e pulsanti**: bordi grigi neutri, angoli 16 px, fuoco bordeaux; tasto "Invia la richiesta" bordeaux sfumato, "Pulisci" bianco con bordo bordeaux; tipologie a pillola con la scelta attiva in bordeaux.
- **Piè di pagina**: riquadro con "© 2026 Studio CAI — Tutti i diritti riservati · Informativa privacy" e "v2.1.0 · Ultimo aggiornamento: 25/09/2026".
- **index.html riscritto pulito**: niente più testi vecchi (v1.6.0, "Centro Amministrazione Immobili") corretti al volo da app.js. Il logo è ridimensionato: la pagina passa da 65 KB a 13 KB e si apre più in fretta.
- Riepilogo prima dell'invio: con "Ferie" scelta e date non ancora indicate ora scrive "periodo da indicare" invece della data di oggi.
- Restano tutte le correzioni della 2.0.1 per iPhone e iPad (date allineate, Inizio/Fine ferie uno sotto l'altro su telefono).

## Cosa NON cambia
Il webhook Make e i dati inviati sono gli stessi (cambia solo "version": "2.1.0"). Restano uguali anche il codice dipendente ricordato, la coda offline con riprova e lo storico delle ultime 5 richieste. Le chiavi di memoria sono le stesse, quindi coda e storico già presenti sui telefoni restano validi.

## File modificati
- `index.html` — riscritto (testata, scheda, piè di pagina, logo alleggerito).
- `styles.css` — riscritto nello stile di casa.
- `app.js` — versione e data; tolte le correzioni al volo di testata e piè di pagina, non più necessarie. Logica di invio invariata.
- `manifest.webmanifest` — nome "Studio CAI — Presenze portieri" e colore di fondo #FBF8F4.

## File invariati (inclusi per completezza)
config.json, employees.json, sw.js, vercel.json, icon.svg, icon-maskable.svg.

## Pubblicazione
Caricare tutti i file della cartella su GitHub/Vercel al posto dei precedenti. Con vercel.json (max-age=0) i telefoni prendono la nuova versione alla prima riapertura.

## Verifica dopo la pubblicazione
Aprire la pagina dal telefono di un portiere. La testata deve essere bianca con lo scudetto e il piè di pagina deve mostrare "v2.1.0 · Ultimo aggiornamento: 25/09/2026". Il codice dipendente deve essere già impostato come prima.
