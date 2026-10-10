# Deployment auf dem VPS

Auf dem VPS liegen eigene Apps unter `/opt/<name>/compose.yaml`, hängen am Docker-Netz `coolify` und werden von Traefik geroutet (Beispiele: `/opt/customer-studio`, `/opt/roaswell-client`). `twenty-server` ist auf diesem Netz als `twenty-server:3000` erreichbar. Die App folgt diesem Muster.

## Voraussetzungen

1. **DNS:** A-Record `app.roaswell.com` auf `82.165.222.228`. `roaswell.com` zeigt direkt auf den VPS, `crm.roaswell.com` läuft über Cloudflare. Liegt die Zone in Cloudflare, den Eintrag auf "nur DNS" stellen, damit Let's Encrypt über Traefik das Zertifikat holen kann.
2. **Twenty-API-Key:** In Twenty unter Einstellungen, APIs und Webhooks einen Key anlegen. Die Rolle des Keys braucht Lese- und Schreibrechte auf Firmen, Kontakte, Deals, Notizen, Aufgaben, Audits, Creator und Assets.
3. **Mail:** SMTP-Zugang (Host, Port, Benutzer, Passwort) für die Login-Links.
4. **Feld für das Portal:** `agency-ops` 0.3.0 veröffentlichen und installieren (`yarn twenty app:publish --private -r roaswell`, dann `app:install`). Es legt `portalAccess` an Kontakten an.

## Auf dem Server

```bash
rsync -a --exclude node_modules --exclude build --exclude .react-router roaswell-app/ root@82.165.222.228:/opt/roaswell-app/
```

Auf dem Server in `/opt/roaswell-app` eine Datei mit den Variablen anlegen (Namen siehe README, `SESSION_SECRET` mit `openssl rand -hex 32` erzeugen), dann:

```bash
cd /opt/roaswell-app && docker compose up -d --build
docker compose logs --tail 30 app
```

## Prüfen

```bash
curl -s https://app.roaswell.com/api/health
```

Erwartet wird `{"status":"ok"}`. Danach im Browser anmelden, mit einer Adresse aus `TEAM_EMAILS`.

## Update

Dateien erneut per `rsync` kopieren und `docker compose up -d --build` ausführen.
