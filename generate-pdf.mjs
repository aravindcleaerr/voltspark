import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';

const md = readFileSync('./COMPETITOR-ANALYSIS.md', 'utf8');

// Convert markdown to HTML manually (covers all constructs we use)
function mdToHtml(text) {
  return text
    // Code blocks
    .replace(/```[\s\S]*?```/g, m => `<pre><code>${m.slice(3, -3).replace(/^[a-z]*\n/, '')}</code></pre>`)
    // HR
    .replace(/^---$/gm, '<hr>')
    // H1
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // H2
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // H3
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // H4
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    // Tables — collect each table block
    .replace(/((?:^\|.+\|\n)+)/gm, (tableBlock) => {
      const rows = tableBlock.trim().split('\n');
      let html = '<table>';
      rows.forEach((row, i) => {
        if (/^\|[-:| ]+\|$/.test(row)) return; // separator row
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
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Unordered list items
    .replace(/^(?:- |\* )(.+)$/gm, '<li>$1</li>')
    // Wrap adjacent <li> in <ul>
    .replace(/(<li>[\s\S]*?<\/li>)(\n(?!<li>)|$)/g, (m) => {
      if (m.startsWith('<li>')) return '<ul>' + m.replace(/\n$/, '') + '</ul>\n';
      return m;
    })
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, '<oli>$1</oli>')
    .replace(/(<oli>[\s\S]*?<\/oli>)(\n(?!<oli>)|$)/g, (m) => '<ol>' + m.replace(/<oli>/g,'<li>').replace(/<\/oli>/g,'</li>').replace(/\n$/, '') + '</ol>\n')
    // Paragraphs — blank-line-separated text blocks
    .split(/\n{2,}/)
    .map(block => {
      block = block.trim();
      if (!block) return '';
      if (/^<(h[1-6]|ul|ol|table|blockquote|pre|hr)/.test(block)) return block;
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

  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
    color: #1a1a2e;
    background: #fff;
  }

  /* ── Cover page ── */
  .cover {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 60px 60px 40px;
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
    color: white;
    page-break-after: always;
  }
  .cover-tag {
    font-size: 9pt;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #93c5fd;
    margin-bottom: 16px;
  }
  .cover h1 {
    font-size: 32pt;
    font-weight: 900;
    line-height: 1.15;
    color: #fff;
    margin-bottom: 18px;
    border: none;
    padding: 0;
  }
  .cover-sub {
    font-size: 14pt;
    color: #bfdbfe;
    margin-bottom: 40px;
    max-width: 480px;
    line-height: 1.4;
  }
  .cover-meta {
    font-size: 9pt;
    color: #93c5fd;
    border-top: 1px solid rgba(255,255,255,0.2);
    padding-top: 20px;
    width: 100%;
  }

  /* ── Content area ── */
  .content {
    padding: 36px 52px 40px;
  }

  h1 {
    font-size: 20pt;
    font-weight: 900;
    color: #0f172a;
    margin: 32px 0 10px;
    padding-bottom: 6px;
    border-bottom: 2.5px solid #2563eb;
    page-break-after: avoid;
  }
  h2 {
    font-size: 14pt;
    font-weight: 800;
    color: #1e3a8a;
    margin: 28px 0 8px;
    page-break-after: avoid;
  }
  h3 {
    font-size: 11.5pt;
    font-weight: 700;
    color: #1d4ed8;
    margin: 20px 0 6px;
    page-break-after: avoid;
  }
  h4 {
    font-size: 10.5pt;
    font-weight: 700;
    color: #374151;
    margin: 14px 0 4px;
    page-break-after: avoid;
  }

  p {
    margin: 6px 0 10px;
    color: #374151;
  }

  hr {
    border: none;
    border-top: 1.5px solid #e2e8f0;
    margin: 24px 0;
    page-break-after: avoid;
  }

  ul, ol {
    margin: 6px 0 12px 20px;
  }
  li {
    margin-bottom: 3px;
    color: #374151;
  }

  strong { color: #0f172a; }
  em { color: #4b5563; }
  code {
    background: #f1f5f9;
    padding: 1px 4px;
    border-radius: 3px;
    font-family: 'Consolas', monospace;
    font-size: 9.5pt;
  }

  blockquote {
    border-left: 4px solid #2563eb;
    background: #eff6ff;
    padding: 10px 16px;
    margin: 12px 0;
    border-radius: 0 6px 6px 0;
    font-style: italic;
    color: #1e40af;
    page-break-inside: avoid;
  }

  /* ── Tables ── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0 18px;
    font-size: 9pt;
    page-break-inside: auto;
  }
  thead {
    background: #1e3a8a;
    color: white;
  }
  th {
    padding: 7px 10px;
    text-align: left;
    font-weight: 700;
    font-size: 8.5pt;
    letter-spacing: 0.3px;
  }
  td {
    padding: 6px 10px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: top;
  }
  tr:nth-child(even) td { background: #f8fafc; }
  tr:hover td { background: #eff6ff; }
  /* VoltSpark row highlight */
  tr:last-child td {
    background: #dbeafe !important;
    font-weight: 700;
    color: #1e40af;
  }

  /* ── Section page breaks ── */
  /* Each H2 competitor profile starts on same page as its content */
  h2 + h3 { page-break-before: avoid; }

  /* Force page break before major sections */
  .page-break { page-break-before: always; }

  /* Competitor cards */
  .competitor-block {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #2563eb;
    border-radius: 0 8px 8px 0;
    padding: 14px 18px;
    margin: 10px 0 18px;
    page-break-inside: avoid;
  }

  /* ── Footer ── */
  @page {
    margin: 14mm 16mm 16mm 16mm;
    @bottom-center {
      content: "VoltSpark — Competitor Benchmark Study · April 2026 · Confidential";
      font-size: 8pt;
      color: #94a3b8;
    }
    @bottom-right {
      content: counter(page);
      font-size: 8pt;
      color: #94a3b8;
    }
  }
  @page :first { @bottom-center { content: ''; } @bottom-right { content: ''; } }
</style>
</head>
<body>

<!-- Cover -->
<div class="cover">
  <div class="cover-tag">Competitive Intelligence · Confidential</div>
  <h1>VoltSpark<br/>Competitor<br/>Benchmark Study</h1>
  <div class="cover-sub">A comprehensive analysis of the industrial energy compliance software landscape in India — positioning, gaps, and strategic moat.</div>
  <div class="cover-meta">
    Prepared by: Akshaya Createch &nbsp;·&nbsp; April 2026 &nbsp;·&nbsp; volt-spark.vercel.app
  </div>
</div>

<!-- TOC -->
<div class="content">
<h1>Table of Contents</h1>
<ol>
  <li>Market Landscape Overview</li>
  <li>Competitor Profiles
    <ul>
      <li>Schneider Electric PME</li>
      <li>Zenatix (Schneider Electric)</li>
      <li>Facilio</li>
      <li>Tor.ai LENZ / Tor Shield</li>
      <li>Siemens SIMATIC Energy Manager PRO</li>
      <li>ABB Ability Energy Manager</li>
      <li>TCS Clever Energy</li>
      <li>Global EHS Platforms</li>
    </ul>
  </li>
  <li>Feature Comparison Matrix</li>
  <li>SWOT Analysis</li>
  <li>Strategic Positioning</li>
</ol>
</div>

<!-- Main content -->
<div class="content page-break">
${body}
</div>

</body>
</html>`;

// Post-process: inject page breaks before major H2 sections and competitor blocks
const processed = html
  // Page break before Feature Comparison Matrix section
  .replace('<h2>Feature Comparison Matrix</h2>', '<h2 class="page-break">Feature Comparison Matrix</h2>')
  // Page break before SWOT
  .replace('<h2>SWOT Analysis</h2>', '<h2 class="page-break">SWOT Analysis</h2>')
  // Page break before Strategic Positioning
  .replace('<h2>Strategic Positioning</h2>', '<h2 class="page-break">Strategic Positioning</h2>')
  // Page break before each numbered competitor (### 1., ### 2., etc.)
  .replace(/<h3>(\d+)\. /g, '<h3 class="page-break">$1. ');

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setContent(processed, { waitUntil: 'networkidle0' });

await page.pdf({
  path: './COMPETITOR-ANALYSIS.pdf',
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: false,
  margin: { top: '14mm', bottom: '18mm', left: '16mm', right: '16mm' },
});

await browser.close();
console.log('✓ COMPETITOR-ANALYSIS.pdf generated');
