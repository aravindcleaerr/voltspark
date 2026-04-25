import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { computeScenarios } from '@/lib/pq/true-pf';

// Dynamic OG image for True PF Revealer share previews.
// Query params: ?dpf=0.92&thdi=0.35&pen=50000  (penalty in ₹)
// Falls back to the InPhase canonical numbers if any param is missing.
// Edge runtime — no Tailwind, inline styles only.

export const runtime = 'edge';

const SIZE = { width: 1200, height: 630 };

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function fmtRupee(n: number): string {
  if (n <= 0) return '₹0';
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${Math.round(n / 1000)}k`;
  return `₹${Math.round(n)}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const dpfRaw = Number(searchParams.get('dpf'));
  const thdiRaw = Number(searchParams.get('thdi'));
  const penRaw = Number(searchParams.get('pen'));

  const dpf = isFinite(dpfRaw) && dpfRaw > 0 ? clamp(dpfRaw, 0.5, 1.0) : 0.92;
  const thdi = isFinite(thdiRaw) && thdiRaw >= 0 ? clamp(thdiRaw, 0, 1.5) : 0.35;
  const pen = isFinite(penRaw) && penRaw >= 0 ? penRaw : 50000;

  const scenarios = computeScenarios({ dpfNow: dpf, thdiNow: thdi, currentPenalty: pen });
  const [now, apfc, ahf] = scenarios;

  return new ImageResponse(
    (
      <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
        padding: '56px 60px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, background: '#0070c6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 28 }}>⚡</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0a406e' }}>VoltSpark</div>
          <div style={{ fontSize: 20, color: '#6b7280', marginLeft: 8 }}>· True PF Revealer</div>
        </div>

        <div style={{ fontSize: 48, fontWeight: 900, color: '#0f172a', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 4, display: 'flex' }}>
          DPF {dpf.toFixed(2)} · THDi {Math.round(thdi * 100)}%
        </div>
        <div style={{ fontSize: 26, fontWeight: 600, color: '#475569', marginBottom: 28, display: 'flex' }}>
          Anchored to a {fmtRupee(pen)}/month penalty
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 'auto' }}>
          {[
            { head: 'NOW', truePf: now.truePF, pen: now.estimatedPenalty, color: '#dc2626', bg: '#fef2f2' },
            { head: 'AFTER APFC', truePf: apfc.truePF, pen: apfc.estimatedPenalty, color: '#d97706', bg: '#fffbeb' },
            { head: 'AFTER AHF', truePf: ahf.truePF, pen: ahf.estimatedPenalty, color: '#16a34a', bg: '#f0fdf4' },
          ].map(c => (
            <div key={c.head} style={{
              flex: 1, background: c.bg, borderRadius: 16,
              padding: '22px 22px', display: 'flex', flexDirection: 'column',
              border: `2px solid ${c.color}33`,
            }}>
              <div style={{ fontSize: 13, letterSpacing: 4, fontWeight: 800, color: c.color, marginBottom: 12, display: 'flex' }}>{c.head}</div>
              <div style={{ fontSize: 15, color: '#64748b', marginBottom: 2, display: 'flex' }}>True PF</div>
              <div style={{ fontSize: 50, fontWeight: 900, color: '#0f172a', lineHeight: 1, marginBottom: 16, display: 'flex' }}>{c.truePf.toFixed(3)}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2, display: 'flex' }}>Penalty / month</div>
              <div style={{ fontSize: 34, fontWeight: 800, color: c.color, display: 'flex' }}>{fmtRupee(c.pen)}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, fontSize: 18, color: '#64748b', display: 'flex' }}>
          volt-spark.vercel.app/tools/true-pf · Free, no signup
        </div>
      </div>
    ),
    { ...SIZE }
  );
}
