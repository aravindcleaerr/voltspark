import { ImageResponse } from 'next/og';
import { computeScenarios } from '@/lib/pq/true-pf';

// Default OG image used when no result is being shared.
// For per-result share previews, use /tools/true-pf/og/route.ts (dynamic).
// next/og runs on Edge — no Tailwind, inline styles only.

export const runtime = 'edge';
export const alt = 'True Power Factor Revealer — VoltSpark';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  // Canonical demo numbers (the InPhase slide). Used when no result params present.
  const scenarios = computeScenarios({ dpfNow: 0.92, thdiNow: 0.35, currentPenalty: 50000 });
  const [now, apfc, ahf] = scenarios;

  return new ImageResponse(
    (
      <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 30 }}>
          <div style={{ width: 44, height: 44, background: '#0070c6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 28 }}>⚡</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0a406e' }}>VoltSpark</div>
          <div style={{ fontSize: 20, color: '#6b7280', marginLeft: 8 }}>· True PF Revealer</div>
        </div>

        <div style={{ fontSize: 56, fontWeight: 900, color: '#0f172a', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 8, display: 'flex' }}>
          Your APFC bank only fixes
        </div>
        <div style={{ fontSize: 56, fontWeight: 900, color: '#0070c6', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 36, display: 'flex' }}>
          half the PF penalty.
        </div>

        <div style={{ display: 'flex', gap: 18, marginTop: 'auto' }}>
          {[
            { head: 'NOW', truePf: now.truePF, pen: now.estimatedPenalty, color: '#dc2626', bg: '#fef2f2' },
            { head: 'AFTER APFC', truePf: apfc.truePF, pen: apfc.estimatedPenalty, color: '#d97706', bg: '#fffbeb' },
            { head: 'AFTER AHF', truePf: ahf.truePF, pen: ahf.estimatedPenalty, color: '#16a34a', bg: '#f0fdf4' },
          ].map(c => (
            <div key={c.head} style={{
              flex: 1, background: c.bg, borderRadius: 16,
              padding: '24px 22px', display: 'flex', flexDirection: 'column',
              border: `2px solid ${c.color}33`,
            }}>
              <div style={{ fontSize: 14, letterSpacing: 4, fontWeight: 800, color: c.color, marginBottom: 14, display: 'flex' }}>{c.head}</div>
              <div style={{ fontSize: 16, color: '#64748b', marginBottom: 4, display: 'flex' }}>True PF</div>
              <div style={{ fontSize: 52, fontWeight: 900, color: '#0f172a', lineHeight: 1, marginBottom: 18, display: 'flex' }}>{c.truePf.toFixed(3)}</div>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4, display: 'flex' }}>Penalty / month</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: c.color, display: 'flex' }}>
                ₹{c.pen >= 1000 ? `${Math.round(c.pen / 1000)}k` : c.pen}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, fontSize: 18, color: '#64748b', display: 'flex' }}>
          volt-spark.vercel.app/tools/true-pf · Free, no signup
        </div>
      </div>
    ),
    { ...size }
  );
}
