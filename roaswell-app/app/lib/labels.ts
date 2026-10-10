export const AREA_LABELS: Record<string, string> = {
  CRAWLABILITY: 'Crawling',
  ON_PAGE: 'On-Page',
  CONTENT_QUALITY: 'Inhaltsqualität',
  LINKS: 'Links',
  STRUCTURED_DATA: 'Strukturierte Daten',
  PERFORMANCE: 'Ladezeit',
  SECURITY: 'Sicherheit',
  VISIBILITY: 'Sichtbarkeit',
  AI_VISIBILITY: 'KI-Sichtbarkeit',
};

export const STATUS_LABELS: Record<string, string> = {
  QUEUED: 'In Warteschlange',
  RUNNING: 'Läuft',
  DONE: 'Fertig',
  FAILED: 'Fehlgeschlagen',
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Offen',
  IN_PROGRESS: 'In Arbeit',
  DONE: 'Erledigt',
  WONT_FIX: 'Verworfen',
};

export const PRIORITY_LABELS: Record<string, string> = {
  CRITICAL: 'Kritisch',
  HIGH: 'Hoch',
  MEDIUM: 'Mittel',
  LOW: 'Niedrig',
};

export const ENGINE_LABELS: Record<string, string> = {
  CHATGPT: 'ChatGPT',
  PERPLEXITY: 'Perplexity',
  GEMINI: 'Gemini',
};

export const getAreaLabel = (area: string): string => AREA_LABELS[area] ?? area;

const SCORE_STRONG = 80;
const SCORE_OKAY = 60;

export const getScoreTone = (score: number): 'success' | 'warning' | 'danger' =>
  score >= SCORE_STRONG ? 'success' : score >= SCORE_OKAY ? 'warning' : 'danger';

export const formatDate = (iso: string | null): string =>
  iso === null
    ? '-'
    : new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const formatHost = (domain: string | null): string =>
  (domain ?? '').replace(/^https?:\/\//, '');

export const STAGE_LABELS: Record<string, string> = {
  NEW: 'Neu',
  SCREENING: 'Prüfung',
  MEETING: 'Gespräch',
  PROPOSAL: 'Angebot',
  CUSTOMER: 'Kunde',
};

export const CRM_TASK_STATUS_LABELS: Record<string, string> = {
  TODO: 'Offen',
  IN_PROGRESS: 'In Arbeit',
  DONE: 'Erledigt',
};

export const formatMoney = (amount: number | null, currency: string): string =>
  amount === null
    ? '-'
    : new Intl.NumberFormat('de-DE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

export const CREATOR_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Entwurf',
  ACTIVE: 'Aktiv',
  ARCHIVED: 'Archiviert',
};

export const ASSET_TYPE_LABELS: Record<string, string> = {
  IMAGE: 'Bild',
  VOICE: 'Stimme',
  VIDEO: 'Video',
};

export const ASSET_STATUS_LABELS: Record<string, string> = {
  QUEUED: 'In Warteschlange',
  RUNNING: 'Wird erzeugt',
  DONE: 'Fertig',
  FAILED: 'Fehlgeschlagen',
};

export const PLATFORM_LABELS: Record<string, string> = {
  TIKTOK: 'TikTok',
  REELS: 'Reels',
  SHORTS: 'Shorts',
};
