# Registro Presenze Portieri — v2.0.1 (23/09/2026)

## Cosa cambia
- **Campi data su iPhone e iPad.** Safari su iOS disegnava la data a modo suo: larghezza minima propria (il campo usciva dalla colonna), testo centrato e altezza ridotta a campo vuoto. Ora le date sono allineate a sinistra e alte 52 px come tutti gli altri campi. Le regole valgono solo su iOS/iPadOS: computer e Android restano identici.
- **Ferie: Inizio e Fine uno sotto l'altro su telefono** (sotto 720 px). Affiancati erano colonne di circa 140 px, troppo strette. Su iPad e computer restano affiancati.
- **Piè di pagina.** Data nel formato 23/09/2026 con la dicitura "Ultimo aggiornamento" e firma solo "Studio CAI — Tutti i diritti riservati" (corretta al caricamento della pagina).

## File modificati
- `styles.css` — blocco "v2.0.1" (cercare "v2.0.1" nel file).
- `app.js` — numero di versione (2.0.1), data di aggiornamento e firma del piè di pagina. Nessuna modifica alla logica di invio.

## File invariati (inclusi per completezza)
index.html, config.json, employees.json, manifest.webmanifest, sw.js, vercel.json, icon.svg, icon-maskable.svg.

Nota: index.html contiene ancora la scritta "v1.6.0" nel piè di pagina, ma app.js la sostituisce al caricamento con "v2.0.1 — ultimo aggiornamento 2026-09-23".

## Pubblicazione
Caricare tutti i file della cartella su GitHub/Vercel al posto dei precedenti. vercel.json impone la rivalidazione dei file (max-age=0), quindi i telefoni prendono il nuovo styles.css alla prima riapertura.

## Verifica dopo la pubblicazione
Da un iPhone: scegliere "Ferie" e controllare che Inizio e Fine siano uno sotto l'altro, a tutta larghezza, con la data allineata a sinistra.
