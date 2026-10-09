import { type FindingDefinition } from 'src/types/finding-definition';
import { type FindingRuleId } from 'src/types/finding-rule-id';

export const FINDING_CATALOG: Record<FindingRuleId, FindingDefinition> = {
  HOMEPAGE_NOINDEX: {
    area: 'CRAWLABILITY',
    severity: 'CRITICAL',
    priority: 'CRITICAL',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: 'Startseite ist auf noindex gesetzt',
        recommendation:
          'Entferne die noindex-Anweisung (Meta-Robots oder X-Robots-Tag) von der Startseite, sonst taucht die Website nicht bei Google auf.',
      },
      EN: {
        title: 'Homepage is set to noindex',
        recommendation:
          'Remove the noindex directive (meta robots or X-Robots-Tag) from the homepage, otherwise the site cannot appear on Google.',
      },
    },
  },
  PAGES_SERVER_ERROR: {
    area: 'CRAWLABILITY',
    severity: 'CRITICAL',
    priority: 'CRITICAL',
    effort: 'MEDIUM',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Seiten liefern einen Serverfehler (5xx)',
        recommendation:
          'Prüfe die Server-Logs dieser Seiten und behebe die Ursache. Serverfehler führen dazu, dass Google Seiten aus dem Index nimmt.',
      },
      EN: {
        title: '{count} pages return a server error (5xx)',
        recommendation:
          'Check the server logs for these pages and fix the cause. Server errors make Google drop pages from the index.',
      },
    },
  },
  ROBOTS_TXT_MISSING: {
    area: 'CRAWLABILITY',
    severity: 'INFO',
    priority: 'LOW',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: 'Keine robots.txt gefunden',
        recommendation:
          'Lege eine robots.txt an und verweise darin auf die Sitemap.',
      },
      EN: {
        title: 'No robots.txt found',
        recommendation: 'Add a robots.txt and reference the sitemap in it.',
      },
    },
  },
  SITEMAP_MISSING: {
    area: 'CRAWLABILITY',
    severity: 'WARNING',
    priority: 'MEDIUM',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: 'Keine XML-Sitemap gefunden',
        recommendation:
          'Erzeuge eine XML-Sitemap mit allen indexierbaren Seiten und reiche sie in der Google Search Console ein.',
      },
      EN: {
        title: 'No XML sitemap found',
        recommendation:
          'Generate an XML sitemap with all indexable pages and submit it in Google Search Console.',
      },
    },
  },
  VIEWPORT_MISSING: {
    area: 'CRAWLABILITY',
    severity: 'WARNING',
    priority: 'MEDIUM',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Seiten ohne Viewport-Angabe',
        recommendation:
          'Ergänze im Head das Meta-Tag viewport, damit Google die Seite als mobilfreundlich erkennt.',
      },
      EN: {
        title: '{count} pages without a viewport tag',
        recommendation:
          'Add the viewport meta tag to the head so Google recognizes the page as mobile friendly.',
      },
    },
  },
  PAGES_NOINDEX: {
    area: 'CRAWLABILITY',
    severity: 'INFO',
    priority: 'LOW',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Seiten sind auf noindex gesetzt',
        recommendation:
          'Prüfe, ob diese Seiten bewusst vom Index ausgeschlossen sind. Wenn nicht, entferne noindex.',
      },
      EN: {
        title: '{count} pages are set to noindex',
        recommendation:
          'Check whether these pages are excluded on purpose. If not, remove noindex.',
      },
    },
  },
  TITLE_MISSING: {
    area: 'ON_PAGE',
    severity: 'WARNING',
    priority: 'HIGH',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Seiten ohne Title-Tag',
        recommendation:
          'Vergib jeder Seite einen eigenen, aussagekräftigen Title mit dem wichtigsten Suchbegriff.',
      },
      EN: {
        title: '{count} pages without a title tag',
        recommendation:
          'Give every page its own descriptive title containing the main search term.',
      },
    },
  },
  TITLE_TOO_LONG: {
    area: 'ON_PAGE',
    severity: 'INFO',
    priority: 'LOW',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Titles sind zu lang (über 60 Zeichen)',
        recommendation:
          'Kürze die Titles auf etwa 60 Zeichen, damit Google sie nicht abschneidet.',
      },
      EN: {
        title: '{count} titles are too long (over 60 characters)',
        recommendation:
          'Shorten titles to about 60 characters so Google does not truncate them.',
      },
    },
  },
  TITLE_TOO_SHORT: {
    area: 'ON_PAGE',
    severity: 'INFO',
    priority: 'LOW',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Titles sind sehr kurz',
        recommendation:
          'Erweitere kurze Titles um den Suchbegriff und einen Nutzen oder Ortsbezug.',
      },
      EN: {
        title: '{count} titles are very short',
        recommendation:
          'Extend short titles with the search term and a benefit or location.',
      },
    },
  },
  TITLE_DUPLICATE: {
    area: 'ON_PAGE',
    severity: 'WARNING',
    priority: 'MEDIUM',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Seiten teilen sich einen doppelten Title',
        recommendation:
          'Schreibe für jede Seite einen eigenen Title. Doppelte Titles lassen Seiten um dieselbe Suchanfrage konkurrieren.',
      },
      EN: {
        title: '{count} pages share a duplicate title',
        recommendation:
          'Write a unique title for each page. Duplicate titles make pages compete for the same query.',
      },
    },
  },
  DESCRIPTION_MISSING: {
    area: 'ON_PAGE',
    severity: 'WARNING',
    priority: 'MEDIUM',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Seiten ohne Meta-Description',
        recommendation:
          'Ergänze für jede Seite eine Meta-Description mit rund 120 bis 160 Zeichen und einem Handlungsaufruf.',
      },
      EN: {
        title: '{count} pages without a meta description',
        recommendation:
          'Add a meta description of roughly 120 to 160 characters with a call to action to every page.',
      },
    },
  },
  DESCRIPTION_TOO_LONG: {
    area: 'ON_PAGE',
    severity: 'INFO',
    priority: 'LOW',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Meta-Descriptions sind zu lang',
        recommendation: 'Kürze die Descriptions auf maximal 160 Zeichen.',
      },
      EN: {
        title: '{count} meta descriptions are too long',
        recommendation: 'Shorten descriptions to at most 160 characters.',
      },
    },
  },
  DESCRIPTION_DUPLICATE: {
    area: 'ON_PAGE',
    severity: 'INFO',
    priority: 'LOW',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Seiten teilen sich eine doppelte Meta-Description',
        recommendation: 'Schreibe für jede Seite eine eigene Description.',
      },
      EN: {
        title: '{count} pages share a duplicate meta description',
        recommendation: 'Write a unique description for each page.',
      },
    },
  },
  H1_MISSING: {
    area: 'ON_PAGE',
    severity: 'WARNING',
    priority: 'MEDIUM',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Seiten ohne H1-Überschrift',
        recommendation:
          'Setze auf jeder Seite genau eine H1, die das Thema der Seite benennt.',
      },
      EN: {
        title: '{count} pages without an H1 heading',
        recommendation:
          'Use exactly one H1 per page that names the topic of the page.',
      },
    },
  },
  H1_MULTIPLE: {
    area: 'ON_PAGE',
    severity: 'INFO',
    priority: 'LOW',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Seiten mit mehreren H1-Überschriften',
        recommendation:
          'Reduziere auf eine H1 pro Seite und nutze H2 bis H6 für Unterpunkte.',
      },
      EN: {
        title: '{count} pages with multiple H1 headings',
        recommendation:
          'Reduce to one H1 per page and use H2 to H6 for sub-sections.',
      },
    },
  },
  LANG_MISSING: {
    area: 'ON_PAGE',
    severity: 'INFO',
    priority: 'LOW',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Seiten ohne lang-Attribut',
        recommendation: 'Setze das lang-Attribut im html-Tag, zum Beispiel lang="de".',
      },
      EN: {
        title: '{count} pages without a lang attribute',
        recommendation: 'Set the lang attribute on the html tag, for example lang="en".',
      },
    },
  },
  CANONICAL_MISSING: {
    area: 'ON_PAGE',
    severity: 'INFO',
    priority: 'LOW',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Seiten ohne Canonical-Tag',
        recommendation:
          'Ergänze einen selbstreferenzierenden Canonical, damit Parameter-Varianten nicht als Duplikate zählen.',
      },
      EN: {
        title: '{count} pages without a canonical tag',
        recommendation:
          'Add a self-referencing canonical so parameter variants do not count as duplicates.',
      },
    },
  },
  IMAGES_WITHOUT_ALT: {
    area: 'ON_PAGE',
    severity: 'WARNING',
    priority: 'MEDIUM',
    effort: 'MEDIUM',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Seiten mit Bildern ohne Alt-Text',
        recommendation:
          'Beschreibe Bilder mit einem kurzen Alt-Text. Das hilft der Bildersuche und der Barrierefreiheit.',
      },
      EN: {
        title: '{count} pages with images missing alt text',
        recommendation:
          'Describe images with a short alt text. It helps image search and accessibility.',
      },
    },
  },
  BROKEN_LINK_ON_HOMEPAGE: {
    area: 'LINKS',
    severity: 'CRITICAL',
    priority: 'HIGH',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: 'Startseite verlinkt auf {count} nicht mehr existierende Seiten',
        recommendation:
          'Korrigiere oder entferne diese Links sofort. Die Startseite ist die am häufigsten gecrawlte Seite.',
      },
      EN: {
        title: 'Homepage links to {count} pages that no longer exist',
        recommendation:
          'Fix or remove these links right away. The homepage is the most crawled page.',
      },
    },
  },
  BROKEN_INTERNAL_LINKS: {
    area: 'LINKS',
    severity: 'WARNING',
    priority: 'HIGH',
    effort: 'MEDIUM',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} intern verlinkte Seiten existieren nicht mehr (4xx)',
        recommendation:
          'Setze auf die Ziele eine 301-Weiterleitung auf die passende Seite oder korrigiere die internen Links.',
      },
      EN: {
        title: '{count} internally linked pages no longer exist (4xx)',
        recommendation:
          'Add a 301 redirect from these targets to the matching page or fix the internal links.',
      },
    },
  },
  NOT_HTTPS: {
    area: 'SECURITY',
    severity: 'CRITICAL',
    priority: 'CRITICAL',
    effort: 'MEDIUM',
    source: 'RULE',
    text: {
      DE: {
        title: 'Website wird nicht über HTTPS ausgeliefert',
        recommendation:
          'Richte ein TLS-Zertifikat ein und leite alle HTTP-Aufrufe per 301 auf HTTPS um.',
      },
      EN: {
        title: 'Website is not served over HTTPS',
        recommendation:
          'Install a TLS certificate and 301-redirect all HTTP requests to HTTPS.',
      },
    },
  },
  MIXED_CONTENT: {
    area: 'SECURITY',
    severity: 'WARNING',
    priority: 'HIGH',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Seiten laden Ressourcen unsicher über HTTP',
        recommendation:
          'Stelle Bild-, Skript- und Stylesheet-URLs auf HTTPS um. Browser blockieren oder markieren solche Inhalte.',
      },
      EN: {
        title: '{count} pages load resources insecurely over HTTP',
        recommendation:
          'Switch image, script and stylesheet URLs to HTTPS. Browsers block or flag such content.',
      },
    },
  },
  SLOW_PAGES: {
    area: 'PERFORMANCE',
    severity: 'WARNING',
    priority: 'MEDIUM',
    effort: 'MEDIUM',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Seiten antworten langsam (über 2 Sekunden)',
        recommendation:
          'Aktiviere Caching und Kompression und prüfe langsame Datenbankabfragen oder große Plugins.',
      },
      EN: {
        title: '{count} pages respond slowly (over 2 seconds)',
        recommendation:
          'Enable caching and compression and check slow database queries or heavy plugins.',
      },
    },
  },
  LCP_SLOW: {
    area: 'PERFORMANCE',
    severity: 'WARNING',
    priority: 'MEDIUM',
    effort: 'MEDIUM',
    source: 'RULE',
    text: {
      DE: {
        title: 'Startseite zeigt auf dem Handy ihren Hauptinhalt zu spät (LCP über 2,5 Sekunden)',
        recommendation:
          'Komprimiere das größte Bild im sichtbaren Bereich, nutze moderne Formate wie WebP oder AVIF, lade es mit hoher Priorität und entferne Skripte, die das Rendern blockieren.',
      },
      EN: {
        title: 'Homepage shows its main content late on mobile (LCP over 2.5 seconds)',
        recommendation:
          'Compress the largest image above the fold, use modern formats such as WebP or AVIF, load it with high priority and remove scripts that block rendering.',
      },
    },
  },
  LCP_VERY_SLOW: {
    area: 'PERFORMANCE',
    severity: 'CRITICAL',
    priority: 'HIGH',
    effort: 'MEDIUM',
    source: 'RULE',
    text: {
      DE: {
        title: 'Startseite zeigt auf dem Handy ihren Hauptinhalt sehr spät (LCP über 4 Sekunden)',
        recommendation:
          'Das ist der größte Hebel für Ladegefühl und Absprungrate. Komprimiere das größte Bild im sichtbaren Bereich, nutze WebP oder AVIF, lade es mit hoher Priorität und entferne große Videos, Slider und blockierende Skripte aus dem ersten Bildschirm.',
      },
      EN: {
        title: 'Homepage shows its main content very late on mobile (LCP over 4 seconds)',
        recommendation:
          'This is the biggest lever for perceived speed and bounce rate. Compress the largest image above the fold, use WebP or AVIF, load it with high priority and remove large videos, sliders and blocking scripts from the first screen.',
      },
    },
  },
  CLS_HIGH: {
    area: 'PERFORMANCE',
    severity: 'WARNING',
    priority: 'MEDIUM',
    effort: 'MEDIUM',
    source: 'RULE',
    text: {
      DE: {
        title: 'Die Startseite springt beim Laden (Layoutverschiebung über 0,1)',
        recommendation:
          'Gib Bildern, Videos und Werbeflächen feste Maße, reserviere Platz für nachladende Inhalte und lade Schriften so, dass der Text nicht umbricht.',
      },
      EN: {
        title: 'The homepage shifts while loading (layout shift over 0.1)',
        recommendation:
          'Give images, videos and ad slots fixed dimensions, reserve space for late content and load fonts so the text does not reflow.',
      },
    },
  },
  TBT_HIGH: {
    area: 'PERFORMANCE',
    severity: 'WARNING',
    priority: 'MEDIUM',
    effort: 'HIGH',
    source: 'RULE',
    text: {
      DE: {
        title: 'Die Startseite reagiert beim Laden verzögert (Blockierzeit über 200 ms)',
        recommendation:
          'Reduziere und verzögere JavaScript, besonders Tracking, Chat-Widgets und Slider, und teile große Skripte in kleinere Teile.',
      },
      EN: {
        title: 'The homepage responds with a delay while loading (blocking time over 200 ms)',
        recommendation:
          'Reduce and defer JavaScript, especially tracking, chat widgets and sliders, and split large scripts into smaller parts.',
      },
    },
  },
  AI_CRAWLERS_BLOCKED: {
    area: 'AI_VISIBILITY',
    severity: 'WARNING',
    priority: 'MEDIUM',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: 'Die robots.txt sperrt {count} KI-Crawler aus',
        recommendation:
          'Prüfe, ob die Sperre gewollt ist. KI-Systeme können eine Website nur nennen, wenn ihre Crawler die Startseite lesen dürfen. Wer in KI-Antworten vorkommen will, erlaubt die Crawler der gewünschten Systeme. Eine Sperre kann auch eine bewusste Entscheidung sein, etwa gegen die Nutzung der Inhalte zum Training.',
      },
      EN: {
        title: 'robots.txt blocks {count} AI crawlers',
        recommendation:
          'Check whether the block is intended. AI systems can only mention a website when their crawlers may read the homepage. Allow the crawlers of the systems you want to appear in. A block can also be a deliberate choice, for example against using the content for training.',
      },
    },
  },
  LLMS_TXT_MISSING: {
    area: 'AI_VISIBILITY',
    severity: 'INFO',
    priority: 'LOW',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: 'Keine llms.txt gefunden',
        recommendation:
          'Eine llms.txt ist eine Textdatei im Hauptverzeichnis, die KI-Systemen die wichtigsten Seiten erklärt. Ob Suchsysteme sie auswerten, ist offen. Der Aufwand ist gering.',
      },
      EN: {
        title: 'No llms.txt found',
        recommendation:
          'An llms.txt is a text file in the root directory that explains the most important pages to AI systems. Whether search systems use it is still open. The effort is low.',
      },
    },
  },
  FAQ_SCHEMA_MISSING: {
    area: 'AI_VISIBILITY',
    severity: 'INFO',
    priority: 'LOW',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: 'Keine FAQ-Auszeichnung gefunden',
        recommendation:
          'Wenn eine Seite häufige Kundenfragen beantwortet, kannst du sie mit FAQPage-Markup auszeichnen. Das hilft Maschinen, Frage und Antwort zu erkennen. Google zeigt dafür kaum noch eigene Rich Results.',
      },
      EN: {
        title: 'No FAQ markup found',
        recommendation:
          'If a page answers frequent customer questions, you can mark it up with FAQPage markup. This helps machines recognize question and answer. Google rarely shows its own rich results for it anymore.',
      },
    },
  },
  AI_NOT_CITED: {
    area: 'AI_VISIBILITY',
    severity: 'WARNING',
    priority: 'HIGH',
    effort: 'HIGH',
    source: 'RULE',
    text: {
      DE: {
        title: 'Bei {count} typischen Kundenfragen nennt keine der ausgewerteten KI-Antworten die Website',
        recommendation:
          'KI-Systeme nennen vor allem Seiten, die eine Frage direkt und mit konkreten Angaben beantworten. Lege zu diesen Fragen eigene Seiten oder Abschnitte an, etwa zu Leistung, Preis, Ablauf und Vergleich, und belege sie mit Zahlen und Quellen. Die Antworten der KI-Systeme schwanken von Lauf zu Lauf, der Befund ist eine Stichprobe.',
      },
      EN: {
        title: 'For {count} typical customer questions none of the evaluated AI answers names the website',
        recommendation:
          'AI systems mostly name pages that answer a question directly and with concrete detail. Create pages or sections for these questions, for example on service, price, process and comparison, and back them with numbers and sources. AI answers vary from run to run, so this finding is a sample.',
      },
    },
  },
  AI_COMPETITOR_PREFERRED: {
    area: 'AI_VISIBILITY',
    severity: 'WARNING',
    priority: 'MEDIUM',
    effort: 'HIGH',
    source: 'RULE',
    text: {
      DE: {
        title: 'KI-Antworten nennen immer wieder dieselben Wettbewerber statt der Website',
        recommendation:
          'Sieh dir an, welche Fragen diese Seiten beantworten und womit sie ihre Aussagen belegen, und beantworte dieselben Fragen konkreter und besser belegt.',
      },
      EN: {
        title: 'AI answers repeatedly name the same competitors instead of the website',
        recommendation:
          'Look at which questions these pages answer and how they back up their claims, and answer the same questions more concretely and with better evidence.',
      },
    },
  },
  HOMEPAGE_STRUCTURED_DATA_MISSING: {
    area: 'STRUCTURED_DATA',
    severity: 'WARNING',
    priority: 'MEDIUM',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: 'Startseite ohne strukturierte Daten',
        recommendation:
          'Ergänze JSON-LD mit Organization oder LocalBusiness, damit Google das Unternehmen eindeutig zuordnen kann.',
      },
      EN: {
        title: 'Homepage without structured data',
        recommendation:
          'Add JSON-LD with Organization or LocalBusiness so Google can identify the business.',
      },
    },
  },
  ORGANIZATION_SCHEMA_MISSING: {
    area: 'STRUCTURED_DATA',
    severity: 'INFO',
    priority: 'LOW',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: 'Keine Organization- oder WebSite-Auszeichnung auf der Startseite',
        recommendation:
          'Ergänze Organization-Markup mit Name, Logo und Kontaktdaten.',
      },
      EN: {
        title: 'No Organization or WebSite markup on the homepage',
        recommendation:
          'Add Organization markup with name, logo and contact details.',
      },
    },
  },
  LOCAL_BUSINESS_SCHEMA_MISSING: {
    area: 'STRUCTURED_DATA',
    severity: 'WARNING',
    priority: 'HIGH',
    effort: 'LOW',
    source: 'CLASSIFIER',
    text: {
      DE: {
        title: 'Lokales Unternehmen ohne LocalBusiness-Auszeichnung',
        recommendation:
          'Die Website bedient erkennbar ein lokales Einzugsgebiet. Ergänze LocalBusiness-Markup mit Adresse, Öffnungszeiten und Einzugsgebiet.',
      },
      EN: {
        title: 'Local business without LocalBusiness markup',
        recommendation:
          'The site clearly serves a local area. Add LocalBusiness markup with address, opening hours and service area.',
      },
    },
  },
  PAGES_WITHOUT_STRUCTURED_DATA: {
    area: 'STRUCTURED_DATA',
    severity: 'INFO',
    priority: 'LOW',
    effort: 'MEDIUM',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Seiten ohne strukturierte Daten',
        recommendation:
          'Ergänze passende Schema.org-Typen (Article, Product, FAQ, Service) auf den wichtigsten Seitentypen.',
      },
      EN: {
        title: '{count} pages without structured data',
        recommendation:
          'Add matching Schema.org types (Article, Product, FAQ, Service) to the most important page types.',
      },
    },
  },
  THIN_CONTENT: {
    area: 'CONTENT_QUALITY',
    severity: 'WARNING',
    priority: 'MEDIUM',
    effort: 'MEDIUM',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Seiten haben sehr wenig Text (unter 150 Wörter)',
        recommendation:
          'Baue diese Seiten inhaltlich aus oder fasse sie mit verwandten Seiten zusammen.',
      },
      EN: {
        title: '{count} pages have very little text (under 150 words)',
        recommendation:
          'Expand these pages or merge them with related pages.',
      },
    },
  },
  LOW_HELPFULNESS: {
    area: 'CONTENT_QUALITY',
    severity: 'WARNING',
    priority: 'HIGH',
    effort: 'HIGH',
    source: 'CLASSIFIER',
    text: {
      DE: {
        title: '{count} Seiten helfen dem Besucher kaum weiter',
        recommendation:
          'Überarbeite diese Seiten: Beantworte die Frage des Besuchers direkt, nenne konkrete Details und ergänze einen klaren nächsten Schritt.',
      },
      EN: {
        title: '{count} pages barely help the visitor',
        recommendation:
          'Rework these pages: answer the visitor question directly, add concrete details and a clear next step.',
      },
    },
  },
  LOW_SPECIFICITY: {
    area: 'CONTENT_QUALITY',
    severity: 'INFO',
    priority: 'MEDIUM',
    effort: 'MEDIUM',
    source: 'CLASSIFIER',
    text: {
      DE: {
        title: '{count} Seiten bleiben zu allgemein',
        recommendation:
          'Ersetze allgemeine Aussagen durch konkrete Leistungen, Zahlen, Beispiele und Ortsbezug.',
      },
      EN: {
        title: '{count} pages stay too generic',
        recommendation:
          'Replace generic statements with concrete services, numbers, examples and location.',
      },
    },
  },
  LOW_TRUST: {
    area: 'CONTENT_QUALITY',
    severity: 'INFO',
    priority: 'MEDIUM',
    effort: 'MEDIUM',
    source: 'CLASSIFIER',
    text: {
      DE: {
        title: '{count} Seiten wirken wenig vertrauenswürdig',
        recommendation:
          'Ergänze Autor, Referenzen, Bewertungen, Zertifikate und vollständige Kontaktdaten.',
      },
      EN: {
        title: '{count} pages appear little trustworthy',
        recommendation:
          'Add author, references, reviews, certificates and complete contact details.',
      },
    },
  },
  NO_RANKINGS: {
    area: 'VISIBILITY',
    severity: 'WARNING',
    priority: 'MEDIUM',
    effort: 'HIGH',
    source: 'RULE',
    text: {
      DE: {
        title: 'Die Website rankt bei Google für keine Keywords',
        recommendation:
          'Prüfe zuerst, ob die Seite indexiert ist. Baue danach Seiten für konkrete Suchanfragen deiner Kunden auf und verlinke sie intern.',
      },
      EN: {
        title: 'The website ranks for no keywords on Google',
        recommendation:
          'First check that the site is indexed. Then build pages for concrete searches your customers make and link them internally.',
      },
    },
  },
  KEYWORD_QUICK_WINS: {
    area: 'VISIBILITY',
    severity: 'INFO',
    priority: 'HIGH',
    effort: 'MEDIUM',
    source: 'CLASSIFIER',
    text: {
      DE: {
        title: '{count} relevante Keywords auf Platz 4 bis 10 können in die Top 3',
        recommendation:
          'Stärke die rankende Seite für diese Suchanfragen: Suchintention direkt beantworten, Überschriften und interne Links gezielt auf das Keyword ausrichten.',
      },
      EN: {
        title: '{count} relevant keywords on positions 4 to 10 can reach the top 3',
        recommendation:
          'Strengthen the ranking page for these searches: answer the search intent directly and align headings and internal links with the keyword.',
      },
    },
  },
  KEYWORD_NEAR_PAGE_ONE: {
    area: 'VISIBILITY',
    severity: 'INFO',
    priority: 'HIGH',
    effort: 'MEDIUM',
    source: 'CLASSIFIER',
    text: {
      DE: {
        title: '{count} relevante Keywords stehen kurz vor Seite 1 (Platz 11 bis 30)',
        recommendation:
          'Hier fehlt oft wenig. Baue die rankende Seite inhaltlich aus oder erstelle eine eigene Seite zum Thema und verlinke sie von starken Seiten.',
      },
      EN: {
        title: '{count} relevant keywords are close to page 1 (positions 11 to 30)',
        recommendation:
          'Often only a little is missing. Expand the ranking page or create a dedicated page for the topic and link to it from strong pages.',
      },
    },
  },
  BACKLINKS_TO_BROKEN_PAGES: {
    area: 'VISIBILITY',
    severity: 'WARNING',
    priority: 'HIGH',
    effort: 'LOW',
    source: 'RULE',
    text: {
      DE: {
        title: '{count} Seiten mit Backlinks von anderen Websites existieren nicht mehr',
        recommendation:
          'Richte für diese URLs eine 301-Weiterleitung auf die passende Seite ein. So geht die Linkkraft nicht verloren.',
      },
      EN: {
        title: '{count} pages with backlinks from other websites no longer exist',
        recommendation:
          'Add a 301 redirect from these URLs to the matching page so the link equity is not lost.',
      },
    },
  },
};
