import { escapeCssString } from 'src/utils/escape-css-string.util';

type BuildReportStylesParams = {
  accentColor: string;
  footerText: string;
  pageWord: string;
};

// The report is a print document and stays on a light surface in every theme.
// Data colors are fixed so a brand color cannot break the palette checks.
export const buildReportStyles = ({
  accentColor,
  footerText,
  pageWord,
}: BuildReportStylesParams): string => `
:root {
  color-scheme: light;
  --surface: #ffffff;
  --canvas: #eceae5;
  --ink: #0b0b0b;
  --ink-2: #52514e;
  --ink-3: #6b6a66;
  --hairline: #e4e3de;
  --tile: #f6f5f2;
  --bar: #2a78d6;
  --bar-track: #cde2fb;
  --rank-1: #184f95;
  --rank-2: #2a78d6;
  --rank-3: #6da7ec;
  --rank-4: #86b6ef;
  --status-good: #0ca30c;
  --status-warning: #fab219;
  --status-serious: #ec835a;
  --status-critical: #d03b3b;
  --status-neutral: #9a998f;
  --accent: ${accentColor};
}
* { box-sizing: border-box; }
@page {
  size: A4;
  margin: 16mm 14mm 20mm;
  @bottom-left { content: "${escapeCssString(footerText)}"; font: 8pt sans-serif; color: #6b6a66; }
  @bottom-right { content: "${escapeCssString(pageWord)} " counter(page) " / " counter(pages); font: 8pt sans-serif; color: #6b6a66; }
}
html { background: var(--canvas); }
body {
  margin: 0;
  color: var(--ink);
  font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 10.5pt;
  line-height: 1.5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.document { max-width: 210mm; margin: 0 auto; padding: 14mm; background: var(--surface); }
.toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin: 0 auto 12px; max-width: 210mm; padding: 12px 14mm 0; color: var(--ink-2); font-size: 9.5pt; }
.toolbar button { font: inherit; padding: 6px 12px; border: 1px solid var(--hairline); border-radius: 6px; background: var(--surface); color: var(--ink); cursor: pointer; }
h1, h2, h3, p { margin: 0; }
p, li { orphans: 3; widows: 3; }
h2 { font-size: 15pt; font-weight: 650; margin: 0 0 4px; break-after: avoid; }
h3 { font-size: 11pt; font-weight: 650; margin: 18px 0 6px; break-after: avoid; }
.lead { color: var(--ink-2); margin-bottom: 14px; break-after: avoid; }
.section { margin-top: 26px; }
.cover { border-top: 6px solid var(--accent); padding-top: 14px; }
.eyebrow { color: var(--ink-3); font-size: 9pt; letter-spacing: 0.06em; text-transform: uppercase; }
.domain { font-size: 21pt; font-weight: 700; margin: 4px 0 2px; word-break: break-all; }
.meta { color: var(--ink-2); font-size: 10pt; }
.hero { display: flex; align-items: baseline; gap: 14px; margin: 22px 0 6px; }
.hero-score { font-size: 64pt; font-weight: 700; line-height: 1; letter-spacing: -0.02em; }
.hero-unit { color: var(--ink-3); font-size: 12pt; }
.grade { border: 1.5px solid var(--ink); border-radius: 999px; padding: 2px 12px; font-weight: 650; font-size: 11pt; }
.summary { color: var(--ink-2); margin-bottom: 16px; }
.tiles { display: grid; grid-template-columns: repeat(var(--tile-columns, 3), 1fr); gap: 8px; margin: 14px 0 6px; }
.tile { background: var(--tile); border-radius: 8px; padding: 10px 12px; }
.tile-label { color: var(--ink-3); font-size: 8.5pt; line-height: 1.3; }
.tile-value { font-size: 20pt; font-weight: 650; line-height: 1.2; }
.meter-row { display: grid; grid-template-columns: 38% 1fr 15% ; align-items: center; gap: 10px; padding: 5px 0; border-bottom: 1px solid var(--hairline); }
.meter-label { font-weight: 550; }
.meter-track { height: 10px; background: var(--bar-track); border-radius: 0 4px 4px 0; overflow: hidden; }
.meter-fill { height: 100%; background: var(--bar); border-radius: 0 4px 4px 0; }
.meter-value { display: flex; align-items: center; gap: 6px; justify-content: flex-end; font-variant-numeric: tabular-nums; }
.meter-value strong { font-size: 11pt; }
.band { display: inline-flex; align-items: center; gap: 5px; color: var(--ink-2); font-size: 9pt; }
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
.dot-STRONG { background: var(--status-good); }
.dot-OKAY { background: var(--status-warning); }
.dot-WEAK, .dot-CRITICAL { background: var(--status-critical); }
.dot-HIGH { background: var(--status-serious); }
.dot-MEDIUM { background: var(--status-warning); }
.dot-LOW { background: var(--status-neutral); }
.note { margin-top: 12px; padding: 8px 12px; background: var(--tile); border-radius: 8px; color: var(--ink-2); font-size: 9.5pt; }
.horizon { margin-top: 20px; }
.horizon-head { break-after: avoid; display: flex; align-items: baseline; gap: 10px; border-bottom: 2px solid var(--ink); padding-bottom: 4px; margin-bottom: 8px; }
.horizon-head h3 { margin: 0; }
.horizon-hint { color: var(--ink-3); font-size: 9pt; }
.task { break-inside: avoid; padding: 10px 0; border-bottom: 1px solid var(--hairline); }
.task-meta { display: flex; flex-wrap: wrap; gap: 6px 14px; color: var(--ink-2); font-size: 8.5pt; margin-bottom: 3px; }
.chip { display: inline-flex; align-items: center; gap: 5px; }
.task-title { font-weight: 650; font-size: 11pt; }
.task-body p { color: var(--ink-2); margin-top: 3px; }
.task-body ul { margin: 4px 0 0; padding-left: 18px; color: var(--ink-2); }
.urls { margin-top: 6px; color: var(--ink-3); font-size: 8.5pt; }
.urls div { word-break: break-all; }
table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin: 4px 0 10px; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
th { text-align: left; color: var(--ink-3); font-weight: 550; font-size: 8.5pt; padding: 4px 6px; border-bottom: 1px solid var(--ink-3); }
td { padding: 4px 6px; border-bottom: 1px solid var(--hairline); vertical-align: top; }
td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
td.url { word-break: break-all; color: var(--ink-3); font-size: 8.5pt; }
.rank-row { display: grid; grid-template-columns: 90px 1fr 60px; align-items: center; gap: 10px; padding: 3px 0; }
.rank-track { display: flex; }
.rank-bar { height: 14px; border-radius: 0 4px 4px 0; }
.small-list { margin: 4px 0 0; padding-left: 18px; color: var(--ink-2); }
.small-list li { word-break: break-all; }
.methodology { color: var(--ink-3); font-size: 9pt; }
.summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px 18px; }
.summary-block h3 { font-size: 10.5pt; margin: 0 0 4px; }
.summary-block ul { margin: 0; padding-left: 18px; color: var(--ink-2); }
.unverified { color: var(--status-critical); font-size: 8.5pt; }
.compare { display: flex; gap: 12px; margin: 6px 0 10px; }
.compare-cell { flex: 1; background: var(--tile); border-radius: 8px; padding: 10px 12px; }
.compare-value { display: block; font-size: 22pt; font-weight: 650; font-variant-numeric: tabular-nums; }
.compare-label { color: var(--ink-3); font-size: 8.5pt; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; margin: 8px 0 12px; }
.page-card { background: var(--tile); border-radius: 8px; padding: 10px 12px; }
.page-card-url { font-size: 8.5pt; word-break: break-all; color: var(--ink-2); }
.page-card-meta { font-size: 8.5pt; color: var(--ink-3); margin: 4px 0 6px; }
.page-card-scores { display: flex; flex-wrap: wrap; gap: 4px; }
.heat { border-radius: 4px; padding: 1px 6px; font-size: 8.5pt; }
td.heat { text-align: center; border-radius: 0; font-variant-numeric: tabular-nums; }
.heat-1 { background: #f6c9c9; } .heat-2 { background: #fadccc; } .heat-3 { background: #fdeab8; }
.heat-4 { background: #cfeccf; } .heat-5 { background: #a6dca6; }
.check { color: var(--status-critical); font-weight: 600; }
@media print { .summary-grid { grid-template-columns: repeat(2, 1fr); } }
.keep-together { break-inside: avoid; }
@media print {
  html { background: none; }
  .document { padding: 0; max-width: none; }
  .toolbar { display: none; }
}
@media (max-width: 640px) {
  .tiles { grid-template-columns: repeat(2, 1fr); }
  .meter-row { grid-template-columns: 1fr; }
}
`;
