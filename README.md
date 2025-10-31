# Registro Presenze Portieri — Studio CAI (v1.1)

Webapp statica per raccogliere segnalazioni mensili dei portieri (ferie, permessi, 104, malattia, ecc.) con invio diretto a **Make** tramite Webhook e raccolta su **Google Sheets** a cura dello scenario Make.

## Novità v1.1
- **Codice dipendente** visibile (niente elenco condomini / nessun nome esposto in UI)
- Footer con **Informativa Privacy** (link Dropbox riutilizzato)
- Logo e grafica **Studio CAI** come nella webapp precedente

## Flusso consigliato in Make
1. **Webhook** riceve il JSON.
2. **Router per mese** → Appendi riga su Google Sheet "Presenze – 2025"
3. A inizio mese: scenario schedulato → filtra mese precedente, crea **Excel/CSV** per consulente e invia mail.

## Payload inviato
- `employee_id` (solo **codice**)
- `event_date`, `event_type`, `full_day`, `start_time`, `end_time`, `hours`, `notes`, `sent_at`

> Il nome dipendente può essere ricostruito su Make incrociando un tuo **Data Store** o uno **Sheet anagrafico**.

## Configurazione rapida
- `config.json` → URL Webhook Make
- `employees.json` → elenco codici (e facoltativo `name` per mapping lato Make)

## Branding
- Logo in `assets/logo.jpg`
- Link privacy: https://www.dropbox.com/scl/fi/pg39geu63s5o2gtq04oq5/INFORMATIVA-SUL-TRATTAMENTO-DEI-DATI-PERSONALI.pdf?rlkey=7zzihoi92roiiqkydn9frt1p9&dl=0


## v1.2
- Aggiornato `employees.json` con i codici dipendente forniti (ordinati).
