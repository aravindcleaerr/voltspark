import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';

const md = readFileSync('./BLUEPRINT-5YEAR.md', 'utf8');

function mdToHtml(text) {
  return text
    .replace(/```[\s\S]*?```/g, m => `<pre><code>${m.slice(3, -3).replace(/^[a-z]*\n/, '')}</code></pre>`)
    .replace(/^---$/gm, '<hr>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/((?:^\|.+\|\n)+)/gm, (tableBlock) => {
      const rows = tableBlock.trim().split('\n');
      let html = '<table>';
      rows.forEach((row, i) => {
        if (/^\|[-:| ]+\|$/.test(row)) return;
        const cells = row.split('|').slice(1, -1).map(c => c.trim());
        if (i === 0) {
          html += '<thead><tr>' + cells.map(c => `<th>${inlineFormat(c)}</th>`).join('') + '</tr></thead><tbody>';
        } else {
          html += '<tr>' + cells.map(c => `<td>${inlineFormat(c)}</td>`).join('') + '</tr>';
        }
      });
      html += '</tbody></table>';
      return html;
    })
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\*\*(.+)\*\*$/gm, '<p class="bold-line">$1</p>')
    .replace(/^(?:- |\* )(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => '<ul>' + m + '</ul>')
    .replace(/^\d+\. (.+)$/gm, '<oli>$1</oli>')
    .replace(/(<oli>[\s\S]*?<\/oli>\n?)+/g, m => '<ol>' + m.replace(/<oli>/g,'<li>').replace(/<\/oli>/g,'</li>') + '</ol>')
    .split(/\n{2,}/)
    .map(block => {
      block = block.trim();
      if (!block) return '';
      if (/^<(h[1-6]|ul|ol|table|blockquote|pre|hr|p )/.test(block)) return block;
      return `<p>${inlineFormat(block.replace(/\n/g, ' '))}</p>`;
    })
    .join('\n');
}

function inlineFormat(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

const body = mdToHtml(md);

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5pt; line-height: 1.6; color: #1a1a2e; background: #fff; }

  /* Cover */
  .cover {
    height: 100vh;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 60px;
    background: linear-gradient(150deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%);
    color: white;
    page-break-after: always;
  }
  .cover-top { display: flex; justify-content: space-between; align-items: flex-start; }
  .cover-logo { font-size: 14pt; font-weight: 900; color: #93c5fd; letter-spacing: 2px; }
  .cover-tag { font-size: 8pt; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #bfdbfe; padding: 4px 10px; border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; }
  .cover-main { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 40px 0; }
  .cover h1 { font-size: 38pt; font-weight: 900; line-height: 1.1; color: #fff; border: none; padding: 0; margin-bottom: 20px; }
  .cover h1 span { color: #60a5fa; }
  .cover-sub { font-size: 13pt; color: #bfdbfe; max-width: 500px; line-height: 1.5; margin-bottom: 40px; }
  .cover-stats { display: flex; gap: 40px; }
  .cover-stat { text-align: center; }
  .cover-stat .num { font-size: 22pt; font-weight: 900; color: #fff; }
  .cover-stat .lbl { font-size: 8pt; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
  .cover-bottom { border-top: 1px solid rgba(255,255,255,0.2); padding-top: 16px; display: flex; justify-content: space-between; align-items: center; font-size: 8.5pt; color: #93c5fd; }

  /* Content */
  .content { padding: 36px 52px 40px; }
  .page-break { page-break-before: always; }

  h1 { font-size: 20pt; font-weight: 900; color: #0f172a; margin: 32px 0 10px; padding-bottom: 8px; border-bottom: 3px solid #2563eb; page-break-after: avoid; }
  h2 { font-size: 15pt; font-weight: 800; color: #1e3a8a; margin: 30px 0 8px; page-break-after: avoid; }
  h3 { font-size: 12pt; font-weight: 700; color: #1d4ed8; margin: 22px 0 6px; page-break-after: avoid; }
  h4 { font-size: 10.5pt; font-weight: 700; color: #374151; margin: 14px 0 4px; page-break-after: avoid; }

  p { margin: 5px 0 10px; color: #374151; }
  .bold-line { font-weight: 700; color: #0f172a; margin: 8px 0; }

  hr { border: none; border-top: 1.5px solid #e2e8f0; margin: 22px 0; }

  ul, ol { margin: 6px 0 12px 22px; }
  li { margin-bottom: 4px; color: #374151; }

  strong { color: #0f172a; font-weight: 700; }
  em { color: #4b5563; }
  code { background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-family: 'Consolas', monospace; font-size: 9pt; }

  blockquote {
    border-left: 4px solid #f59e0b;
    background: #fffbeb;
    padding: 10px 16px;
    margin: 12px 0;
    border-radius: 0 6px 6px 0;
    color: #92400e;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }

  /* Year section headers */
  .year-header {
    background: linear-gradient(135deg, #1e3a8a, #2563eb);
    color: white;
    padding: 16px 20px;
    border-radius: 10px;
    margin: 0 0 18px;
  }
  .year-header h2 { color: white; margin: 0 0 2px; font-size: 16pt; }
  .year-header .theme { color: #bfdbfe; font-size: 10pt; font-style: italic; }

  /* Tables */
  table { width: 100%; border-collapse: collapse; margin: 14px 0 18px; font-size: 9pt; page-break-inside: auto; }
  thead { background: #1e3a8a; color: white; }
  th { padding: 8px 10px; text-align: left; font-weight: 700; font-size: 8.5pt; }
  td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  tr:nth-child(even) td { background: #f8fafc; }

  /* Arc table special styling */
  .arc-table thead { background: #0f172a; }
  .arc-table tr:last-child td { background: #dbeafe !important; font-weight: 700; color: #1e3a8a; }

  /* Highlight box */
  .highlight { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px 18px; margin: 14px 0; page-break-inside: avoid; }
  .highlight strong { color: #1e40af; }

  @page {
    margin: 14mm 16mm 16mm 16mm;
    @bottom-left { content: "VoltSpark · 5-Year Strategic Blueprint · April 2026 · Confidential"; font-size: 8pt; color: #94a3b8; }
    @bottom-right { content: counter(page); font-size: 8pt; color: #94a3b8; }
  }
  @page :first { @bottom-left { content: ''; } @bottom-right { content: ''; } }
</style>
</head>
<body>

<!-- Cover -->
<div class="cover">
  <div class="cover-top">
    <div class="cover-logo">⚡ VoltSpark</div>
    <div class="cover-tag">Internal · Confidential</div>
  </div>
  <div class="cover-main">
    <h1>5-Year<br/>Strategic<br/><span>Blueprint</span></h1>
    <div class="cover-sub">April 2026 – March 2031<br/>From first revenue to platform ecosystem — the roadmap to ₹60–80 Cr ARR and 10,000+ industrial sites.</div>
    <div class="cover-stats">
      <div class="cover-stat"><div class="num">₹80Cr</div><div class="lbl">ARR Target (Yr 5)</div></div>
      <div class="cover-stat"><div class="num">10,000+</div><div class="lbl">Client Sites</div></div>
      <div class="cover-stat"><div class="num">1,000+</div><div class="lbl">Consultants</div></div>
      <div class="cover-stat"><div class="num">5</div><div class="lbl">Countries</div></div>
    </div>
  </div>
  <div class="cover-bottom">
    <span>Akshaya Createch · Bengaluru · volt-spark.vercel.app</span>
    <span>April 2026</span>
  </div>
</div>

<!-- TOC -->
<div class="content">
<h1>Table of Contents</h1>
<ol>
  <li>Vision &amp; Current State</li>
  <li>The 5-Year Arc (Summary)</li>
  <li>Year 1 — First Revenue (Apr 2026–Mar 2027)</li>
  <li>Year 2 — Proven Model (Apr 2027–Mar 2028)</li>
  <li>Year 3 — Market Leadership (Apr 2028–Mar 2029)</li>
  <li>Year 4 — Horizontal Expansion (Apr 2029–Mar 2030)</li>
  <li>Year 5 — Platform &amp; Ecosystem (Apr 2030–Mar 2031)</li>
  <li>Cumulative Revenue Trajectory</li>
  <li>Funding Roadmap</li>
  <li>Critical Success Factors</li>
</ol>
</div>

<!-- Main body -->
<div class="content page-break">
${body}
</div>

</body>
</html>`;

// Inject year-section styling and page breaks
const processed = html
  .replace(/<h2>Year 1: First Revenue<\/h2>/g,
    '<div class="year-header page-break"><h2>Year 1: First Revenue</h2><div class="theme">April 2026 – March 2027 &nbsp;·&nbsp; Theme: Convert pilots to paying clients. Prove the consultant model.</div></div>')
  .replace(/<h2>Year 2: Proven Model<\/h2>/g,
    '<div class="year-header page-break"><h2>Year 2: Proven Model</h2><div class="theme">April 2027 – March 2028 &nbsp;·&nbsp; Theme: Demonstrate the consultant channel scales. Build for Series A.</div></div>')
  .replace(/<h2>Year 3: Market Leadership<\/h2>/g,
    '<div class="year-header page-break"><h2>Year 3: Market Leadership</h2><div class="theme">April 2028 – March 2029 &nbsp;·&nbsp; Theme: Become the default platform for Indian industrial compliance consultants.</div></div>')
  .replace(/<h2>Year 4: Horizontal Expansion<\/h2>/g,
    '<div class="year-header page-break"><h2>Year 4: Horizontal Expansion</h2><div class="theme">April 2029 – March 2030 &nbsp;·&nbsp; Theme: Healthcare, hospitality, commercial real estate, first international markets.</div></div>')
  .replace(/<h2>Year 5: Platform &amp; Ecosystem<\/h2>/g,
    '<div class="year-header page-break"><h2>Year 5: Platform &amp; Ecosystem</h2><div class="theme">April 2030 – March 2031 &nbsp;·&nbsp; Theme: VoltSpark as the operating layer for India&apos;s industrial energy ecosystem.</div></div>')
  .replace(/<h2>Cumulative Revenue Trajectory<\/h2>/g,
    '<h2 class="page-break">Cumulative Revenue Trajectory</h2>')
  .replace(/<h2>The 5-Year Arc<\/h2>/g,
    '<h2 class="page-break">The 5-Year Arc</h2>')
  // Style the arc table
  .replace(/<table>(\s*<thead>\s*<tr>\s*<th>Year<\/th>)/,
    '<table class="arc-table">$1');

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setContent(processed, { waitUntil: 'networkidle0' });

await page.pdf({
  path: './VoltSpark 5-Year Blueprint.pdf',
  format: 'A4',
  printBackground: true,
  margin: { top: '14mm', bottom: '18mm', left: '16mm', right: '16mm' },
});

await browser.close();
console.log('✓ VoltSpark 5-Year Blueprint.pdf generated');
