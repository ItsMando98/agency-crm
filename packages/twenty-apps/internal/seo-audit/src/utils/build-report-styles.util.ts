type BuildReportStylesParams = {
  accentColor: string;
};

const HEX_PAIR_LENGTH = 2;
const DARKEN_FACTOR = 0.78;

const toRgb = (hexColor: string): [number, number, number] => [
  parseInt(hexColor.slice(1, 1 + HEX_PAIR_LENGTH), 16),
  parseInt(hexColor.slice(3, 3 + HEX_PAIR_LENGTH), 16),
  parseInt(hexColor.slice(5, 5 + HEX_PAIR_LENGTH), 16),
];

const darken = (hexColor: string): string =>
  `rgb(${toRgb(hexColor)
    .map((channel) => Math.round(channel * DARKEN_FACTOR))
    .join(',')})`;

// The ROASWELL look: black surface, one red accent, condensed capitals for
// headings. The report is a dark print document, so colors are printed as shown.
// The page loads nothing from outside (its policy forbids it), so the named
// fonts only apply when installed and the system fallbacks carry the look.
export const buildReportStyles = ({ accentColor }: BuildReportStylesParams): string => {
  const [red, green, blue] = toRgb(accentColor);

  return `
:root{
  color-scheme: dark;
  --bg:#0a0a0b; --bg-2:#101013; --card:#131317; --line:#232329;
  --red:${accentColor}; --red-d:${darken(accentColor)}; --red-glow:rgba(${red},${green},${blue},.18);
  --red-line:rgba(${red},${green},${blue},.35);
  --tx:#f4f4f5; --tx-2:#a1a1aa; --tx-3:#8a8a93;
  --ok:#3ddc97; --mid:#ffb020; --crit:#ff3347;
  --display:'Barlow Condensed','Arial Narrow',Impact,sans-serif; --body:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
  --serif:'Instrument Serif',Georgia,serif; --mono:'JetBrains Mono',ui-monospace,Menlo,monospace;
  --max:1120px;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;background:var(--bg);-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{background:var(--bg);color:var(--tx);font-family:var(--body);line-height:1.6;-webkit-font-smoothing:antialiased;font-size:16px}
a{color:inherit}
.wrap{max-width:var(--max);margin:0 auto;padding:0 24px}
section{padding:96px 0;border-top:1px solid var(--line);position:relative}
.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--tx-3);display:flex;gap:10px;align-items:center;margin-bottom:28px}
.eyebrow::before{content:"";width:6px;height:6px;background:var(--red);display:inline-block}
h1,h2,h3{font-family:var(--display);text-transform:uppercase;line-height:.95;letter-spacing:-.01em;font-weight:800}
h1{font-size:clamp(52px,9vw,116px);overflow-wrap:anywhere}
h2{font-size:clamp(36px,5.5vw,68px);margin-bottom:20px}
h3{font-size:26px;line-height:1.05}
.red{color:var(--red)}
.serif{font-family:var(--serif);font-style:italic;text-transform:none;font-weight:400;letter-spacing:0}
.lead{font-size:19px;color:var(--tx-2);max-width:760px}
.muted{color:var(--tx-2)} .tiny{font-size:12px;color:var(--tx-3)}
.mono{font-family:var(--mono)}
.src{font-family:var(--mono);font-size:11px;color:var(--tx-3);margin-top:18px;letter-spacing:.03em;line-height:1.7}
.src::before{content:"↳ ";color:var(--red)}
.c-crit{--c:var(--crit)} .c-mid{--c:var(--mid)} .c-good{--c:var(--ok)}
.tbl td.st-y,.chip.st-y{color:var(--ok)} .tbl td.st-p,.chip.st-p{color:var(--mid)} .tbl td.st-n,.chip.st-n{color:var(--crit)} .tbl td.st-v,.chip.st-v{color:var(--tx-3)}
.chip.st-y{border-color:#14382b} .chip.st-n{border-color:#3a141a} .chip.st-p{border-color:#3d2d0a}

.top{position:sticky;top:0;z-index:50;background:rgba(10,10,11,.88);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.top .wrap{display:flex;justify-content:space-between;align-items:center;height:56px;gap:12px}
.logo{font-family:var(--display);font-weight:800;font-size:20px;letter-spacing:.04em;text-decoration:none;text-transform:uppercase}
.top-actions{display:flex;gap:10px;align-items:center}
.btn{display:inline-flex;align-items:center;gap:10px;background:var(--red);color:#fff;font:600 14px/1 var(--body);padding:12px 22px;border-radius:999px;text-decoration:none;transition:.2s;border:0;cursor:pointer}
.btn:hover{background:var(--red-d);transform:translateY(-1px);box-shadow:0 8px 30px var(--red-glow)}
.btn.ghost{background:transparent;border:1px solid var(--line);color:var(--tx-2)}
.btn.ghost:hover{background:var(--card);box-shadow:none}
.btn.invert{background:#fff;color:#0a0a0b}

.hero{padding:88px 0 72px;border:0;background:radial-gradient(900px 480px at 85% 0%,var(--red-glow),transparent 70%)}
.hero h1{font-size:clamp(48px,7vw,96px)}
.hero h1 .serif{display:block;font-size:.58em;line-height:1.1;margin-top:.14em}
.hero .meta{display:flex;flex-wrap:wrap;gap:12px 28px;margin:36px 0 0;font-family:var(--mono);font-size:12px;color:var(--tx-3);text-transform:uppercase;letter-spacing:.1em}
.hero .meta b{color:var(--tx);font-weight:500}
.hero-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:56px;align-items:center;margin-top:40px}
.verdict{font-size:20px;color:var(--tx-2);max-width:560px}
.verdict strong{color:var(--tx)}
.gauge-card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:32px;text-align:center}
.gauge{--s:50;width:210px;height:210px;border-radius:50%;margin:0 auto 20px;display:grid;place-items:center;background:conic-gradient(var(--c,var(--red)) calc(var(--s)*1%),#1d1d22 0)}
.gauge::before{content:"";grid-area:1/1;width:172px;height:172px;border-radius:50%;background:var(--card)}
.gauge span{grid-area:1/1;font-family:var(--display);font-size:84px;font-weight:800;line-height:1;z-index:1}
.badge{display:inline-block;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;padding:6px 12px;border-radius:999px;border:1px solid var(--c,var(--line));color:var(--c,var(--tx-2))}

.marquee{overflow:hidden;border-block:1px solid var(--line);padding:22px 0;background:var(--bg-2)}
.marquee-track{display:flex;gap:48px;white-space:nowrap;animation:m 38s linear infinite;width:max-content}
.marquee-track span{font-family:var(--display);font-weight:800;font-size:46px;text-transform:uppercase}
.marquee-track span:nth-child(even){color:var(--red);font-size:30px}
.marquee-track span.o{-webkit-text-stroke:1px var(--tx-3);color:transparent}
@keyframes m{to{transform:translateX(-50%)}}

.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-top:48px}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:28px}
.kpi .num{font-family:var(--display);font-size:56px;font-weight:800;line-height:1}
.kpi .num.hot{color:var(--red)}
.kpi p{color:var(--tx-2);font-size:14px;margin-top:8px}
.impact{background:linear-gradient(135deg,#1a0a0d,#131317);border:1px solid var(--red-line);border-radius:20px;padding:40px;margin-top:40px;display:grid;grid-template-columns:1fr auto;gap:32px;align-items:center}
.impact .num{font-family:var(--display);font-size:clamp(48px,7vw,88px);font-weight:800;color:var(--red);line-height:1;text-align:right;white-space:nowrap}

.digest{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;margin-top:40px}
.digest-card{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--c,var(--red));border-radius:14px;padding:24px}
.digest-card h3{font-size:22px;margin-bottom:12px}
.digest-card ul{list-style:none;color:var(--tx-2);font-size:14.5px}
.digest-card li{padding:8px 0;border-top:1px solid var(--line)}
.digest-card li:first-child{border-top:0;padding-top:0}
.unverified{display:inline-block;margin-left:6px;font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--crit);border:1px solid #3a141a;border-radius:999px;padding:1px 8px}

.cats{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;margin-top:48px}
.cat{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:24px}
.cat header{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:14px}
.cat header b{font-family:var(--display);font-size:24px;text-transform:uppercase;font-weight:700}
.cat header em{font-family:var(--display);font-style:normal;font-size:34px;font-weight:800;color:var(--c)}
.bar{height:6px;border-radius:6px;background:#1d1d22;overflow:hidden;margin-bottom:12px}
.bar i{display:block;height:100%;width:calc(var(--v)*1%);background:var(--c,var(--red));border-radius:6px}
.cat p{font-size:14px;color:var(--tx-2)}

.finding{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--c,var(--red));border-radius:14px;padding:32px;margin-bottom:20px}
.finding .head{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:14px}
.finding .id{font-family:var(--mono);font-size:12px;color:var(--tx-3)}
.finding h3{margin-bottom:18px}
.finding dl{display:grid;grid-template-columns:130px 1fr;gap:14px 20px;font-size:15px}
.finding dt{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--tx-3);padding-top:3px}
.finding dd{color:var(--tx-2)} .finding dd strong{color:var(--tx)}
.finding dd ul{margin:8px 0 0 18px}
.evidence{background:#0c0c0f;border:1px dashed var(--line);border-radius:10px;padding:14px 16px;font-family:var(--mono);font-size:12.5px;color:var(--tx-2);word-break:break-word}
.evidence div+div{margin-top:4px}
.chips{display:flex;gap:8px;flex-wrap:wrap}
.chip{font-family:var(--mono);font-size:11px;padding:4px 10px;border:1px solid var(--line);border-radius:999px;color:var(--tx-2)}

.tbl{width:100%;border-collapse:collapse;margin-top:32px;font-size:14px}
.tbl th{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--tx-3);text-align:left;padding:12px 14px;border-bottom:1px solid var(--line)}
.tbl td{padding:14px;border-bottom:1px solid var(--line);color:var(--tx-2);vertical-align:top}
.tbl td:first-child{color:var(--tx)}
.tbl td.st{font-family:var(--mono);font-size:12px;white-space:nowrap}
.tbl td.num,.tbl th.num{text-align:right;font-variant-numeric:tabular-nums}
.tbl td.url{word-break:break-all;font-family:var(--mono);font-size:12px;color:var(--tx-3)}
.tbl td.h{text-align:center;font-family:var(--mono);font-variant-numeric:tabular-nums}
.tbl td.h1,.tbl td.h2{color:var(--crit);background:rgba(255,51,71,.1)}
.tbl td.h3{color:var(--mid);background:rgba(255,176,32,.08)}
.tbl td.h4,.tbl td.h5{color:var(--ok);background:rgba(61,220,151,.08)}
.tbl tr.own td{color:var(--tx);background:var(--red-glow)}
.tbl-wrap{overflow-x:auto}
.sub{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--tx-3);margin:44px 0 0}
.ranks{display:grid;gap:10px;margin-top:20px}
.rank{display:grid;grid-template-columns:70px 1fr 70px;gap:14px;align-items:center;font-size:14px;color:var(--tx-2)}
.rank .bar{margin:0}
.rank b{text-align:right;color:var(--tx);font-variant-numeric:tabular-nums}

.strengths{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-top:32px}
.strength{border:1px solid #14382b;background:#0b1511;border-radius:14px;padding:22px}
.strength b{color:var(--ok);font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase}
.strength p{margin-top:8px;color:var(--tx-2);font-size:14.5px}

.road{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px}
.phase{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:28px}
.phase .d{font-family:var(--display);font-size:60px;font-weight:800;color:var(--red);line-height:1}
.phase .d small{font-size:20px;color:var(--tx-3);margin-left:6px}
.phase h3{margin:10px 0 14px}
.phase ul{list-style:none;color:var(--tx-2);font-size:14.5px}
.phase li{padding:8px 0;border-top:1px solid var(--line)}
.phase .res{margin-top:16px;font-size:13px;color:var(--tx)}

.method{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:28px;align-items:start}
.method .wide{grid-column:1/-1}
.method div{border:1px solid var(--line);border-radius:12px;padding:18px;font-size:13.5px;color:var(--tx-2)}
.method b{display:block;color:var(--tx);font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px}
.hint{margin-top:20px;font-size:13px;color:var(--tx-3);font-family:var(--mono)}
.review{margin-top:32px}
.review ul{margin:10px 0 0 18px;color:var(--tx-2);font-size:13.5px;word-break:break-all}

.cta{background:var(--red);color:#fff;border:0;padding:110px 0 90px;overflow:hidden}
.cta h2{font-size:clamp(64px,13vw,190px);line-height:.85;color:#0a0a0b;margin:0 0 36px}
.cta h2 .w{color:#fff}
.cta-row{display:flex;flex-wrap:wrap;gap:20px;justify-content:space-between;align-items:center}
.cta p{font-size:18px;max-width:520px}
.cta .eyebrow{color:rgba(255,255,255,.8)} .cta .eyebrow::before{background:#fff}

footer{padding:56px 0 32px;border-top:1px solid var(--line)}
.wm{font-family:var(--display);font-weight:800;font-size:clamp(56px,14vw,190px);line-height:.8;color:#17171b;text-transform:uppercase;letter-spacing:-.01em;margin:36px 0 24px;user-select:none;overflow:hidden}
.foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px}

@page{size:A4;margin:0}
@media(max-width:860px){
  section{padding:64px 0}
  .hero-grid,.impact,.road{grid-template-columns:1fr}
  .impact .num{text-align:left}
  .finding dl{grid-template-columns:1fr;gap:6px}
  .finding dt{padding-top:10px}
  .gauge{width:170px;height:170px}.gauge::before{width:138px;height:138px}.gauge span{font-size:64px}
}
@media print{
  html,body{background:#0a0a0b}
  .top,.marquee,.btn.ghost{display:none!important}
  .wrap{max-width:none;padding:0 14mm}
  section{padding:36px 0;break-inside:auto}
  .hero{padding:48px 0 36px}
  .finding,.cat,.phase,.kpi,.strength,.digest-card,.gauge-card,.impact{break-inside:avoid}
  tr{break-inside:avoid}
  thead{display:table-header-group}
  .cta{padding:56px 0}
  .wm{font-size:120px}
}
@media(prefers-reduced-motion:reduce){.marquee-track{animation:none}}
`;
};
