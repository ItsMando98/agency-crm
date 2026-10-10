# M0 Findings

Stand 2026-10-10. Quellen: Twenty-Server-Code, treg-Katalog. Nicht gegen den VPS getestet, weil dafür ein API-Key fehlt.

## 1. Twenty REST von außen

- Basis: `GET {TWENTY_API_URL}/rest/<namePlural>`, Header `Authorization: Bearer <api key>`.
- Antwort: `{ data: { <namePlural>: [...] }, totalCount, pageInfo: { hasNextPage, startCursor, endCursor } }`.
- Query: `filter`, `order_by`, `limit`, `starting_after`, `ending_before`, `depth` (0 bis 2).
- Filter: `field[comparator]:value`, Komparatoren `eq neq in containsAny is gt gte lt lte startsWith endsWith like ilike`.
  Mehrere Bedingungen mit `and(a,b)`, `or(a,b)`, `not(a)`. Werte dürfen in `"` stehen, Arrays als `["A","B"]`.
- Sortierung: `order_by=createdAt[DescNullsLast],name[AscNullsFirst]`.
- Der Server begrenzt `limit` auf `QUERY_MAX_RECORDS`.
- Ein Datensatz wird mit `POST /rest/<namePlural>` angelegt, mit `PATCH /rest/<namePlural>/<id>` geändert.

## 2. Dateien

- Excel und PDF eines Audits liegen in FILES-Feldern. Der Abruf mit API-Key ist ungeklärt und muss gegen den VPS geprüft werden.
- Der Bericht ist ohne Anmeldung über `reportUrl` erreichbar (Share-Token), das reicht für die erste Version als Einbettung.
- Upload an `ugcAsset.file` erfolgt aus der Twenty-App selbst (wie `upload-audit-files.util.ts`), nicht aus der Webapp.

## 3. treg-Generierung (Katalog, 2026-10-10)

| Art | Endpunkt | Preis | Ablauf |
| --- | --- | --- | --- |
| Bild | `reapi.image-gen.gemini-3-pro-image` | 0,034 USD | Anzeige Katalog, 99,9 % Erfolg |
| Bild (Alternative) | `piapi.image-gen.gpt-image-2-5` | 0,161 USD | |
| Stimme | `google-ai.voice-gen.gemini-3-8-flash-tts` | ca. 0,01 USD pro Skript, Obergrenze 0,05 | synchron, Antwort inline als base64 WAV (24 kHz), 30 Stimmen |
| Video | `replicate.video-gen.veo-3.1-fast` | 0,10 USD/s ohne, 0,15 USD/s mit Ton, 4 bis 8 s | asynchron, Poll über `replicate.predictions.get`, Ergebnis-URL kurzlebig, muss kopiert werden |
| Video (günstig) | `openrouter.x.google-veo-3-1-lite` | 0,64 USD pro Aufruf | |
| Video (Bild zu Video) | `minimax.video-gen.from_image` | 0,56 USD pro Aufruf | |

Mit echten Aufrufen bestätigt (2026-10-10):

- Bild: Aufruf gibt `{ id, status: 'processing' }` zurück (0,03 USD). `reapi.tasks.get` mit `id` liefert nach kurzer Zeit `status: 'completed'` und `output.image_urls[0]` (jpg). Das Polling kostet nichts.
- Stimme: antwortet synchron mit `candidates[0].content.parts[0].inlineData` (base64 WAV), Kosten 0,0008 USD für einen Satz. Mit `fields=` bleibt die Antwort klein.
- Video: nur aus der Dokumentation, nicht ausgelöst (Mindestpreis 0,40 USD).

Offen: Wie Twenty die Dateien eines FILES-Felds über REST ausliefert (Feld `url` oder signierte Adresse). Die Galerie liest `file[0].url` und zeigt sonst den Hinweis, dass die Datei in Twenty liegt.

Seedance 2.5 kostet 13 bis 26 USD pro Aufruf und wird nicht angeboten.
treg-Guthaben am 2026-10-10: 0,90 USD, reicht für Bilder und Stimme, nicht für mehr als ein bis zwei Videos.

## 4. E-Mail

Offen, braucht eine Entscheidung des Auftraggebers (SMTP oder Resend). Bis dahin schreibt der Dev-Modus den Magic Link ins Server-Log.
