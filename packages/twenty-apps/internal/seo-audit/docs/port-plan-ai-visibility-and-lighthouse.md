# Port-Plan: AI-Sichtbarkeit und Lighthouse in die App `seo-audit`

Stand: 2026-10-08. Quelle: `roaswell-audit-kit 2` (Python-Kit) und der aktuelle Code der App (Version 0.1.3).

## 1. Ziel

Die App bekommt zwei Dinge, die sie heute nicht hat:

1. **Lighthouse (mobil)**: Core Web Vitals und Performance-Score der Startseite, als Messwerte im Bereich `PERFORMANCE`.
2. **AI-Sichtbarkeit**: Wird die Website in KI-Antworten (ChatGPT, Perplexity, Gemini, Google AI Overview) auf typische Kundenfragen genannt oder zitiert? Dazu ein Readiness-Check (Crawler-Zugriff, llms.txt, Schema), der nichts kostet.

Nicht im Scope: Social, Google-Profil, Ads, Conversion, Modul-Router, Mailsequenz, Lead-Magnet-Sperre im Report. Das sind spätere Pakete (siehe Abschnitt 10).

## 2. Ausgangslage

| | App (TypeScript, in Twenty) | Kit (Python) |
|---|---|---|
| Crawl und On-Page-Regeln | eigener Crawler, 60 Seiten, 8 Bereiche | DataForSEO On-Page (150 Seiten) |
| Rankings, Backlinks, Wettbewerber | ja (DataForSEO, in Tests nur gegen Mocks) | ja |
| Core Web Vitals | nein, nur `SLOW_PAGES` über Antwortzeit | Lighthouse über DataForSEO, ungetestet |
| KI-Sichtbarkeit | nein | 3 Engines + AI Overview, ungetestet |
| Report, Excel, PDF, Share-Link, Agent-Tools, DE/EN | ja | nur HTML, nur Deutsch |

Konsequenz: Die Logik des Kits (Klassifikation `cited`/`mentioned`/`absent`/`nv`, Präsenzquote, Readiness-Checks, Lint-Prinzip "Zahl muss im Beleg stehen") wird in die TypeScript-Architektur der App übernommen. Python, Agenten-Pipeline und Template-Engine des Kits werden nicht portiert.

## 3. Entscheidungen im Design

1. **Kein neues Scoring-Modell für Performance.** Lighthouse-Werte erzeugen Findings mit Schweregrad (wie alle anderen Regeln). `computeAreaScores` zieht daraus die Strafpunkte ab. So bleibt `PERFORMANCE` erklärbar und die Task-Liste konsistent.
2. **Neuer Bereich `AI_VISIBILITY`** (`SEO_AREA`, `AREA_WEIGHTS`), Gewicht 15. Der Score wird deterministisch berechnet, nicht vom Modell geschätzt:
   - `presence = (cited + 0,5 * mentioned) / getestete Zeilen` (Zeilen mit `nv` zählen nicht).
   - `readiness = bestandene Checks / alle Checks`.
   - Mit Messung: `round(100 * (0,7 * presence + 0,3 * readiness))`. Ohne Messung (kein DataForSEO): nur `readiness`, im Report als "nur Vorbereitung geprüft" gekennzeichnet.
   - Unbekannt (`nv`) ist nie eine Lücke, genau wie im Kit.
3. **Readiness kostet nichts** und läuft immer (robots.txt-Regeln für `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended` über das vorhandene `parseRobotsRules` und `isPathAllowed`; `llms.txt`; Organization-Schema und FAQ-Schema über die vorhandene Structured-Data-Prüfung). **Presence kostet Geld** und läuft nur mit DataForSEO-Zugang und aktivierter Einstellung.
4. **Speicherung zuerst schlank:** flache Zahlenfelder auf `seoAudit` für alles, was Agenten filtern oder vergleichen (Lighthouse-Werte, `aiPresenceRate`, `aiQueriesTested`) und ein `RAW_JSON`-Feld `aiVisibility` für die Zeilen (Frage, Ergebnis je Engine, "stattdessen genannt"). Ein eigenes Objekt je Frage kommt erst, wenn jemand in der CRM-Tabelle danach filtern will.
5. **Fehler isolieren wie bisher:** Jeder neue Request läuft über `attempt(...)` wie in `collectMarketData`. Ein Fehler wird zu einer Zeile in den Notes, der Audit läuft weiter.

## 4. Phase 0: Smoke-Test (Blocker, vor jeder Zeile Code)

Alle Endpunkte und Antwortformen des Kits sind ungeprüft. Einmal von Hand gegen die echte API, mit einer Testdomain (zum Beispiel `roaswell.com`):

- Lighthouse: Pfad und Antwortform von `/on_page/lighthouse/live/json` (mobil). Wo stehen LCP, CLS, TBT und der Performance-Score in der Antwort?
- LLM-Antworten: Pfade und **gültige Modellnamen** je Engine (im Kit `VERIFY`). Wo stehen Antworttext und Quellen/URLs in der Antwort?
- SERP: Wie sieht der `ai_overview`-Block aus, und wie oft fehlt er?
- Kosten pro Request (`cost` im Envelope) für alle drei.

**Stand der Doku-Prüfung (2026-10-08, aus der DataForSEO-Doku, noch nicht live bestätigt):**

- ChatGPT: `POST /ai_optimization/chat_gpt/llm_responses/live`, ein Task je Request. Pflichtfelder `user_prompt` (maximal 500 Zeichen) und `model_name`; `web_search: true` ist nötig, damit überhaupt Quellen kommen. Antworttext in `tasks[0].result[0].items[]` beim Eintrag `type: "message"` unter `sections[].text`, Quellen in `sections[].annotations[].url` (`null`, wenn `web_search` aus ist, und auch mit `web_search` manchmal leer). Kosten im Envelope (`cost`).
- Modelllisten: `/ai_optimization/{llm}/llm_responses/models` mit `llm` aus `chat_gpt`, `perplexity`, `gemini`, `claude`. Die Doku nennt die HTTP-Methode nicht, eine Drittquelle sagt GET. Der Smoke-Test probiert GET.
- Es gibt auch eine **Claude**-Engine. Das ist eine Option für Entscheidung 2.
- Lighthouse: `POST /on_page/lighthouse/live/json`, Felder `url`, `for_mobile`, `categories`. Werte stehen in `tasks[0].result[0].audits["largest-contentful-paint" | "cumulative-layout-shift" | "total-blocking-time"]` als `numericValue` (Millisekunden). **Ein Kategorie-Score für Performance ist in der Doku nicht beschrieben**; der Smoke-Test prüft, ob `categories.performance.score` existiert. Beispielkosten laut Doku: 0,00425 USD je Task. Timeout einer Lighthouse-Messung: 120 Sekunden, höchstens 30 gleichzeitige Requests.
- Konsequenz für den Plan: `LighthouseSummary.performanceScore` ist optional (`null`, wenn die API ihn nicht liefert); die Findings stützen sich auf LCP, CLS und TBT.

**Ergebnis des Smoke-Tests (2026-10-08, live gegen die API, Domain `roaswell.com`, 5 bezahlte Requests, 0,0898 USD):**

| Request | Modell | Kosten | Befund |
|---|---|---|---|
| Lighthouse mobil | Lighthouse 13.4.0 | 0,005 USD | `categories.performance.score` **existiert** (0,65). LCP 7137 ms, CLS 0,0005, TBT 182 ms stehen in `audits[...]`. |
| ChatGPT | `gpt-5.4-mini` | 0,0217 USD | `items`: 2 Einträge `reasoning` plus 1 `message`. 9 Quellen. Die URLs tragen `?utm_source=openai`, die Hosts teils `www.`. |
| Perplexity | `sonar` | 0,0063 USD | 1 `message`, 10 Quellen mit direkter URL. `title` ist ein verklebter Suchtreffer-Text, nicht brauchbar. |
| Gemini | `gemini-3.5-flash` | 0,0548 USD | 45 Quellen, aber `url` ist immer eine Google-Weiterleitung (`vertexaisearch.cloud.google.com/...`). Die echte Adresse steht in `direct_url` (bei 45 von 45 gesetzt), `title` ist die Domain. 11 verschiedene Domains. |
| SERP Google | Desktop, DE | 0,002 USD | Es gibt einen `ai_overview`-Block, er ist aber **leer** (`asynchronous_ai_overview: true`, `items`, `references` und `markdown` sind `null`). |

Folgerungen, die im weiteren Plan gelten:

1. **Lighthouse über DataForSEO ist entschieden.** Es kostet 0,005 USD, liefert den Performance-Score und alle drei Messwerte. `LighthouseSummary.performanceScore` ist deshalb kein optionales Feld mehr, bleibt aber `null`, wenn ein Lauf ihn nicht liefert. Die Antwort ist riesig (mit eingebettetem Vollseiten-Screenshot); die Fixture im Repo wird auf die benötigten Felder gekürzt.
2. **Quellen immer über `direct_url ?? url` auswerten**, dann die Adresse normalisieren: Query-Parameter wie `utm_source` entfernen, `www.` entfernen, Domain kleinschreiben. Das Kit hätte bei Gemini jede Zitierung übersehen, denn es sucht die Domain als Text in der Antwort, und die steht dort nur in `direct_url`/`title`. Beim Zählen der Quellen je Domain deduplizieren (45 Quellen sind nur 11 Domains).
3. **`ai_overview` braucht `load_async_ai_overview: true`** im SERP-Request, sonst kommt der Block leer zurück. Laut Doku kostet das 0,002 USD zusätzlich je Request und wird erstattet, wenn es keinen Overview gibt. Die Struktur des gefüllten Blocks ist noch **nicht gesehen**. Das ist offen und wird mit einem zweiten Probeaufruf geklärt, bevor der Parser geschrieben wird.
4. **Reasoning-Einträge in der ChatGPT-Antwort überspringen.** Nur Einträge `type: "message"` zählen.
5. **Kosten pro Audit (Schätzung):** Je Frage kosten alle vier Quellen zusammen etwa 0,087 USD (mit Async-Overview etwa 0,089). Bei 10 Fragen sind das etwa 0,9 USD plus 0,005 für Lighthouse. Gemini macht davon etwa 63 Prozent aus. Möglichkeiten zum Sparen: kleineres Gemini-Modell (`gemini-3.5-flash-lite`), weniger Fragen oder Gemini abschaltbar. Die Kosten schwanken mit der Antwortlänge, das ist eine Stichprobe mit einer Frage.

Beifang: Die Startseite von `roaswell.com` hat einen mobilen LCP von **7,1 s** (Google nennt über 4 s schlecht) bei einem Performance-Score von 0,65. Das ist ein echter Befund für eure eigene Website.

Ergebnis: Antworten als **Fixtures** unter `src/__mocks__/` speichern (Muster: `build-dataforseo-envelope.mock.ts`, `create-recording-fetch.mock.ts`). Die Parser und Tests in Phase 1 und 2 werden gegen diese echten Antworten geschrieben, nicht gegen geratene.

Entscheidung am Ende dieser Phase: Lighthouse über DataForSEO (gleiche Zugangsdaten, gleiche Fehlerbehandlung) oder über die Google PageSpeed Insights API (kostenlos, eigener Key, nicht geprüft). Empfehlung: DataForSEO, weil es keinen zweiten Zugang braucht. Der Client wird hinter einer kleinen Funktion `fetchLighthouse` gekapselt, damit ein Wechsel später nur eine Datei betrifft.

Aufwand: etwa ein halber Tag, plus wenige Euro API-Kosten.

## 5. Phase 1: Lighthouse

**Neue Dateien** (Muster: die bestehenden `fetch-*.ts` und `parse-*.util.ts`):

- `src/dataforseo-client/fetch-lighthouse.ts`: ein Request, mobil, Startseite. Gibt `{ lighthouse, cost }` zurück.
- `src/utils/parse-lighthouse.util.ts`: macht aus der Antwort einen Typ `LighthouseSummary` (`performanceScore`, `lcpMs`, `cls`, `tbtMs`, `fetchedAt`). Fehlende Felder werden `null`, nie 0.
- `src/types/lighthouse-summary.ts`.
- `src/utils/check-core-web-vitals.util.ts`: erzeugt Findings aus `LighthouseSummary`.

**Geänderte Dateien:**

- `src/types/market-data.ts`: neues Feld `lighthouse: LighthouseSummary | null`.
- `src/dataforseo-client/collect-market-data.ts`: ein weiterer `attempt('Lighthouse', ...)` im bestehenden `Promise.all`.
- `src/types/finding-rule-id.ts` und `src/constants/finding-catalog.const.ts`: neue Regeln (der Katalog ist ein `Record<FindingRuleId, ...>`, der Compiler erzwingt DE und EN):
  - `LCP_SLOW` (Warnung ab 2,5 s, kritisch ab 4,0 s)
  - `CLS_HIGH` (ab 0,1 / 0,25)
  - `TBT_HIGH` (ab 200 ms / 600 ms)
  - Alle Werte sind Startwerte und werden in Phase 0 gegen die aktuelle Lighthouse-Doku geprüft. Sie liegen in `src/constants/seo-thresholds.const.ts` neben `SLOW_RESPONSE_THRESHOLD_MS`.
- `src/utils/build-findings.util.ts`: ruft `checkCoreWebVitals` auf, wenn `marketData?.lighthouse` vorhanden ist.
- `src/objects/seo-audit.object.ts`: flache Felder `mobilePerformanceScore`, `mobileLcpMs`, `mobileCls`, `mobileTbtMs` (NUMBER, nullable). Neue Felder brauchen neue `universalIdentifier`.
- `src/utils/build-market-audit-data.util.ts`: schreibt die Felder in `persistSeoAuditResult`.
- Report: `build-report-market-html.util.ts` (Kennzahlen-Kacheln mit Ampelfarbe), `build-report-markdown.util.ts`, Excel-Übersichtsblatt (`add-overview-sheet.util.ts`), Labels in `report-labels.const.ts`, `report-html-labels.const.ts`, `excel-labels.const.ts` (DE und EN). Alle Texte laufen durch `escapeHtml`.

**Verhalten ohne DataForSEO:** Kein Lighthouse, kein Fehler, der Bereich `PERFORMANCE` bleibt wie heute (nur Antwortzeit). Der Report sagt das in einer Zeile, wie er es für Marktdaten schon tut (`isMarketDataConfigured`).

Aufwand: etwa ein Tag.

## 6. Phase 2a: AI-Readiness (kostenlos)

**Neue Dateien:**

- `src/utils/check-ai-readiness.util.ts`: liefert `AiReadiness` mit je einem Status (`ok`, `partial`, `no`, `nv`) für `gptbot`, `claudebot`, `perplexitybot`, `googleExtended`, `llmsTxt`, `organizationSchema`, `faqSchema`. Crawler-Status kommt aus der bereits geladenen robots.txt (kein neuer Request). `llms.txt` ist ein einzelner GET auf die eigene Domain, mit dem vorhandenen `fetchPage` und SSRF-Schutz.
- `src/types/ai-readiness.ts`.

**Neue Findings (alle `source: 'RULE'`, also gemessen):**

- `AI_CRAWLERS_BLOCKED` (Warnung, wenn mindestens ein KI-Crawler per `Disallow` ausgesperrt ist; Hinweis im Text, dass das eine bewusste Entscheidung sein kann)
- `LLMS_TXT_MISSING` (Info; die Wirkung von `llms.txt` ist umstritten, deshalb nur Info)
- `FAQ_SCHEMA_MISSING` (Info)
- Organization-Schema: vorhandenes `ORGANIZATION_SCHEMA_MISSING` wiederverwenden, nicht doppeln.

Ergänzungen in `finding-rule-id.ts`, `finding-catalog.const.ts`, `build-findings.util.ts`, `compute-area-scores.util.ts` (neuer Bereich), `score-weights.const.ts`, `seo-audit.constants.ts` (`SEO_AREA.AI_VISIBILITY`). Beim Umsetzen prüfen: Das Task-Feld `area` in `seo-audit-task.object.ts` hat Select-Optionen; die neue Option `AI_VISIBILITY` muss dort ankommen (ein Schema-Update bei der Installation).

Aufwand: etwa ein Tag.

## 7. Phase 2b: AI-Presence (kostenpflichtig)

**Ablauf in der Pipeline** (`run-seo-audit-pipeline.util.ts`, parallel zu Klassifikator und Marktdaten, nach dem Crawl, weil Firmenprofil und Seitentitel gebraucht werden):

1. **Fragen erzeugen** (`src/anthropic-client/generate-ai-queries.ts`, Muster: `assess-site-profile.ts`): 8 bis 10 kaufnahe, lokale, vergleichende und preisbezogene Kundenfragen aus `siteProfile`, Seitentiteln und Markt. Lint wie im Kit: keine Markennamen in den Fragen, keine Duplikate, Sprache passend zum Markt. Optional übergibt ein Agent eigene Fragen über ein neues Eingabefeld `aiQueries` in `start-seo-audit-input.schema.ts`; dann entfällt die Erzeugung.
2. **Abfragen** (`src/dataforseo-client/fetch-ai-answers.ts`): je Frage und Engine ein Request, begrenzte Parallelität (Muster: `runWithConcurrency`). Dazu je Frage ein SERP-Request mit `load_async_ai_overview: true` für den `ai_overview`-Block (ohne den Parameter kommt der Block leer zurück). Hartes Limit `AI_MAX_REQUESTS` (Start: 40) und eine Deadline (Start: 240 s), damit die Funktion mit `timeoutSeconds: 600` nicht in den Timeout läuft. Nicht fertige Zeilen werden `nv` mit Note.
3. **Klassifizieren** (`src/utils/classify-ai-answer.util.ts`, Port von `derive_aio.py`):
   - `cited`: Domain des Kunden steht in einer URL der **strukturierten Quellenliste** der Antwort (je Quelle `direct_url ?? url`, ohne `www.` und ohne Query-Parameter; bei Gemini ist `url` nur eine Weiterleitung).
   - `mentioned`: Markenname steht im Antworttext, aber keine URL der Domain.
   - `absent`: Antwort vorhanden, weder noch.
   - `nv`: keine oder leere Antwort (weniger als 20 Zeichen Inhalt).
   - `instead`: bis zu 3 häufigste fremde Domains, ohne Suchmaschinen, Social, Wikipedia (die Liste gibt es schon als `GENERIC_COMPETITOR_DOMAINS`).
   - **Abweichung vom Kit:** Das Kit durchsucht die gesamte Antwort als Text. Die App wertet nach Phase 0 die konkreten Felder aus (Antworttext, Quellen), damit zum Beispiel ein Echo der Frage oder der Modellname nie als Treffer zählt.
   - Markennamen-Varianten kommen aus Domain-Label, Firmenname des verknüpften `company`-Datensatzes und Titel der Startseite.
4. **Score und Findings** (`compute-ai-visibility-score.util.ts`, `check-ai-presence.util.ts`):
   - `AI_NOT_CITED` (Warnung bzw. kritisch bei Präsenzquote unter einem Schwellwert; `details` enthält 3 Beispiele "Frage, genannt statt Ihnen: domain").
   - `AI_COMPETITOR_PREFERRED` (wenn dieselbe fremde Domain in mindestens 3 Fragen statt des Kunden auftaucht).
   - Beide sind `source: 'RULE'`, weil gemessen. Ein Finding entsteht nur, wenn mindestens 6 Zeilen auswertbar waren (das Kit verlangt mindestens 8 Fragen mit Ergebnissen in mindestens zwei Engines).

**Umsetzungsstand und Abweichungen (2026-10-09):**

- Umgesetzt sind ChatGPT (`gpt-5.4-mini`), Perplexity (`sonar`) und Gemini (`gemini-3.5-flash`). Die Modellnamen stehen in `ai-visibility.const.ts`.
- **AI Overview fehlt noch.** Der gefüllte Block wurde nicht gesehen. Dafür gibt es die Stufe `--stage overview` im Smoke-Test-Skript. Erst nach diesem Probeaufruf wird ein Parser geschrieben.
- Die Einstellung heißt `SEO_AUDIT_AI_VISIBILITY` mit den Werten `OFF` (Standard) und `ON`. Die Engines sind nicht einzeln abschaltbar.
- Markennamen werden nur aus der Domain abgeleitet (`deriveBrandNames`). Seitentitel und der Firmenname des verknüpften CRM-Datensatzes fließen nicht ein, damit kurze, häufige Wörter keine "erwähnt"-Treffer erzeugen. Der Firmenname wäre eine sinnvolle Ergänzung, sobald der Audit-Datensatz ihn an die Pipeline durchreicht.
- Fragen: 8 Stück (`AI_QUERY_COUNT`), das Modell schreibt 10 und was den Firmennamen enthält, fällt weg. Unter 5 brauchbaren Fragen wird übersprungen.
- Limits: höchstens 30 Requests und 240 s Zeitbudget. Überzählige Requests werden als `UNKNOWN` mit Notiz geführt.
- Findings erscheinen erst ab 6 auswertbaren Fragen. `AI_NOT_CITED` kommt bei einer Präsenzquote unter 50 Prozent, `AI_COMPETITOR_PREFERRED` bei einem Wettbewerber in mindestens 3 der Fragen ohne Nennung.
- Kosten und Notizen der KI-Abfragen werden zu `marketDataCostUsd` und `marketDataNotes` addiert.
- Zeilen der Tabelle liegen im JSON-Feld `aiVisibility`; Phase 3 reicht sie an `get_seo_audit` weiter.

**Neue Einstellungen** (`application-variable-keys.const.ts`, `application.config.ts`, Setup-UI):

- `SEO_AUDIT_AI_VISIBILITY` (`true`/`false`, Standard **aus**, weil es Geld kostet)
- optional `SEO_AUDIT_AI_ENGINES` (Standard: alle drei plus AI Overview)
- Modellnamen je Engine als Konstanten in `dataforseo.const.ts`, Werte aus Phase 0.

**Persistenz:** `seoAudit` bekommt `aiPresenceRate` (NUMBER), `aiQueriesTested` (NUMBER), `aiVisibility` (RAW_JSON); die Notes laufen in `marketDataNotes`, die Kosten addieren sich in `marketDataCostUsd`.

Aufwand: zwei bis drei Tage, davon der größte Teil Parser und Tests gegen die Fixtures aus Phase 0.

## 8. Phase 3: Report, Vergleich, Agent-Tools

- **HTML-Report:** neuer Abschnitt "AI-Sichtbarkeit" (Matrix Fragen mal Engines mit Chips `genannt` / `erwähnt` / `fehlt` / `n/v`, Spalte "stattdessen genannt", Readiness-Checkliste). Eigene Funktion `build-report-ai-visibility-html.util.ts` im Stil von `build-report-market-html.util.ts`, eingebunden in `build-report-html.util.ts`. Die Content-Security-Policy des Reports bleibt unverändert, es kommen keine Skripte dazu.
- **Excel:** neues Blatt `add-ai-visibility-sheet.util.ts` (nur wenn Daten vorhanden, wie die Marktblätter).
- **Markdown:** Abschnitt in `build-report-markdown.util.ts`, damit Agenten ihn lesen.
- **Vergleich** (`compute-audit-comparison.util.ts`, `compare_seo_audits`): Präsenzquote und Lighthouse-Werte im Delta. Bereiche, die in einem der beiden Audits fehlen, werden nur einzeln gezeigt, nicht verrechnet. Der Gesamtscore ändert sich ab der neuen Version wegen des zusätzlichen Bereichs; das steht im Changelog und in der Ausgabe von `compare_seo_audits`.
- **Agent-Tools:** `get_seo_audit` liefert Lighthouse-Werte, Präsenzquote und die Zeilen; `list_seo_audit_tasks` kennt den Bereich `AI_VISIBILITY` (`list-seo-audit-tasks-input.schema.ts`); `start_seo_audit` bekommt `aiQueries`. Skill-Text in `skills/seo-audit.skill.ts` und `packages/twenty-claude-skills/skills/seo-audit/SKILL.md` ergänzen.

Aufwand: eineinhalb Tage.

## 9. Tests und Auslieferung

**Tests** (vitest, wie in der App üblich, Verhalten statt Implementierung):

- `classify-ai-answer`: je ein Fall für `cited`, `mentioned`, `absent`, `nv`, Echo der Frage, Quelle nur als Subdomain, Markenname als Teilwort.
- `compute-ai-visibility-score`: Grenzwerte, nur Readiness, keine auswertbaren Zeilen.
- `parse-lighthouse`: echte Fixture, fehlende Felder.
- `check-core-web-vitals`: Schwellen.
- `check-ai-readiness`: robots.txt mit `Disallow` für einzelne Crawler, `User-agent: *`, fehlende robots.txt.
- Pipeline-Test mit Fake-Fetch: Ein DataForSEO-Fehler bei Lighthouse oder KI darf den Audit nicht kippen; die Deadline lässt unfertige Zeilen `nv` werden.
- Regression: Bestehende Tests für Scores und Vergleich laufen unverändert, wenn keine neuen Daten vorliegen.

**Auslieferung:**

1. Version `0.2.0` der App (neuer Bereich), Hinweis im README.
2. Backup mit `/opt/twenty/backup.sh`, dann `app:publish --private` und `app:install` auf `roaswell`, wie zuletzt.
3. Test-Audit auf der eigenen Domain mit eingeschaltetem `SEO_AUDIT_AI_VISIBILITY`; Kosten und Laufzeit notieren.
4. Beacon & Bold erst danach.

Rollback: vorherige App-Version neu installieren; die neuen Felder bleiben leer stehen, das schadet nicht.

## 10. Risiken

| Risiko | Gegenmaßnahme |
|---|---|
| Antwortformen der API weichen vom Kit ab | Phase 0 vor allem anderen; Parser nur gegen echte Fixtures |
| Laufzeit: Crawl, Klassifikator und 40 KI-Requests in 600 s | Parallel ausführen, Deadline, begrenzte Parallelität, unfertige Zeilen als `nv` |
| Kosten pro Audit steigen | Standard aus, Request-Limit, Kosten in `marketDataCostUsd` und Notes sichtbar |
| KI-Antworten schwanken von Lauf zu Lauf | Im Report als Stichprobe kennzeichnen, Datum der Messung zeigen |
| Gesamtscore alter und neuer Audits nicht vergleichbar | Bereichsweiser Vergleich, Hinweis im Changelog |
| Rechtliches: DataForSEO-Daten in Berichten an Kunden | Vor dem Versand an Dritte klären; intern unkritisch |
| Neue Select-Option am Task-Feld `area` | Beim ersten Install auf dem Testworkspace prüfen |

Zurückgestellt: Lead-Magnet-Sperre im Report (3 bis 5 Findings sichtbar, Rest als Zahl), Modul-Router, Follow-up-Sequenz als Twenty-Workflow, Social/GBP/Ads/Conversion.

## 11. Offene Entscheidungen

1. Lighthouse über DataForSEO (Empfehlung) oder PageSpeed Insights?
2. Welche Engines von Anfang an? Empfehlung: ChatGPT, Perplexity, Gemini und AI Overview, mit Möglichkeit zum Abschalten.
3. Standard für `SEO_AUDIT_AI_VISIBILITY`: aus (Empfehlung) oder an?
4. Gewicht des neuen Bereichs: 15 (Empfehlung, wie `VISIBILITY`) oder höher? Das Kit gibt AIO 25 Prozent, die App hat acht Bereiche.
5. Fragen automatisch erzeugen (Empfehlung als Standard) und zusätzlich per Agent überschreibbar?

## 12. Reihenfolge und Aufwand (Schätzung)

| Phase | Inhalt | Aufwand |
|---|---|---|
| 0 | Smoke-Test, Fixtures, Entscheidung 1 | 0,5 Tag |
| 1 | Lighthouse | 1 Tag (**umgesetzt am 2026-10-09**, 587 Tests grün, Build ok, noch nicht committet und nicht deployt) |
| 2a | AI-Readiness | 1 Tag (**umgesetzt am 2026-10-09**, 618 Tests grün, Build ok, noch nicht deployt) |
| 2b | AI-Presence | 2 bis 3 Tage (**umgesetzt am 2026-10-09 für ChatGPT, Perplexity und Gemini**, 696 Tests grün, Build ok, noch nicht deployt; AI Overview folgt) |
| 3 | Report, Excel, Vergleich, Agent-Tools | 1,5 Tage |
| 4 | Release auf `roaswell`, Test-Audit | 0,5 Tag |

Phase 1 und 2a sind unabhängig von den KI-Endpunkten und können direkt nach Phase 0 parallel laufen. Phase 2b hängt an den Fixtures aus Phase 0.
