# Roaswell App

Webapp für Audits, CRM und AI-UGC-Creator. Twenty (crm.roaswell.com) bleibt das Backend, die App hat keine eigene Datenbank.

## Stand

- M1 Audits: Login per Magic Link, Übersicht, Audit-Liste, Audit starten, Detail mit Score, Bereichen, Aufgaben (Status ändern), KI-Sichtbarkeit, Keywords, Vergleich mit dem vorigen Audit.
- M2 CRM: Firmen (Liste, Anlage, Detail mit Kontakten, Deals, Notizen, Aufgaben, Audits), Kontakte, Pipeline über die fünf Phasen.
- M3 Creator: Profile verwalten, Bilder, Stimmen und Kurzvideos bestellen, Galerie mit Kosten. Die Erzeugung läuft in der Twenty-App `creator-studio` (`packages/twenty-apps/internal/creator-studio`), die Webapp legt nur den Auftrag an und zeigt das Ergebnis.
- M4 Kundenportal: Kunden melden sich mit der Adresse eines Kontakts an, der in Twenty das Feld `portalAccess` hat (Feld kommt aus `agency-ops` 0.3.0) und zu einer Firma gehört. Einladung und Entzug auf der Firmenseite. Ein Kunde sieht nur Audits, Berichte und Creator seiner Firma, nie das CRM.
- Plan und Befunde: `docs/m0-findings.md`.

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
| `TWENTY_PUBLIC_URL` | nein | Adresse des Twenty-Workspace, Standard `https://crm.roaswell.com`. Darüber werden die Berichts-Links gebaut |
| `APP_URL` | nein | öffentliche Adresse, Teil des Login-Links |
| `TEAM_PASSWORD_HASH` | empfohlen | Hash des Team-Passworts. Erzeugen mit `printf '%s' "passwort" \| node scripts/hash-password.mjs` |
| `SETTINGS_DIR` | nein | Ablage der Einstellungen, Standard `./data` (im Container `/data`, Volume) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | nein | Rückfall für den Mailversand. Normalerweise stellst du Resend oder SMTP in der App unter Einstellungen ein |

## Rechte

Die App spricht mit einem einzigen API-Key, der alles sieht. Deshalb erzwingt `app/lib/twenty/audits.server.ts` die Sicht pro Rolle: Ein Kunde bekommt immer den Filter auf seine Firma, nur das Team darf Audits starten und Aufgaben ändern. Neue Datenzugriffe gehören in diese Schicht und brauchen einen Test dafür.

## Deployment

Siehe `docs/DEPLOY.md`.
