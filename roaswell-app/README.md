# Roaswell App

Webapp für Audits, CRM und AI-UGC-Creator. Twenty (crm.roaswell.com) bleibt das Backend, die App hat keine eigene Datenbank.

## Stand

- M1 Audits: Login per Magic Link, Übersicht, Audit-Liste, Audit starten, Detail mit Score, Bereichen, Aufgaben (Status ändern), KI-Sichtbarkeit, Keywords, Vergleich mit dem vorigen Audit.
- Folgt: M2 CRM, M3 Creator Studio, M4 Kundenportal. Plan siehe `docs/m0-findings.md` und den Projektplan.

## Entwicklung

```bash
npm install
npm run dev        # Port 3100
npm test
npm run typecheck
npm run lint
```

## Umgebungsvariablen

| Variable | Pflicht | Bedeutung |
| --- | --- | --- |
| `TWENTY_API_KEY` | ja | API-Key aus Twenty, bleibt auf dem Server |
| `SESSION_SECRET` | ja | mindestens 32 Zeichen, signiert Login-Links und Sitzungen |
| `TEAM_EMAILS` | ja | kommagetrennte Adressen mit Team-Zugriff |
| `TWENTY_API_URL` | nein | Standard `http://twenty-server:3000` |
| `APP_URL` | nein | öffentliche Adresse, Teil des Login-Links |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | in Produktion ja | Versand der Login-Links. Ohne `SMTP_HOST` schreibt der Entwicklungsmodus den Link ins Log |

## Rechte

Die App spricht mit einem einzigen API-Key, der alles sieht. Deshalb erzwingt `app/lib/twenty/audits.server.ts` die Sicht pro Rolle: Ein Kunde bekommt immer den Filter auf seine Firma, nur das Team darf Audits starten und Aufgaben ändern. Neue Datenzugriffe gehören in diese Schicht und brauchen einen Test dafür.

## Deployment

`compose.yaml` hängt die App ans Coolify-Netz und routet `app.roaswell.com` über Traefik. Voraussetzungen: DNS-Eintrag, die Variablen oben in Coolify, ein Twenty-API-Key.
