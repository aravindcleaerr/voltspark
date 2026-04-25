import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

// Persists a True PF Revealer submission and returns a share token + URL.
// Public endpoint — rate-limited per IP. Email is optional; missing email
// must not block persistence (the tool still produces a result either way).

interface ScenarioPayload {
  label: 'now' | 'afterAPFC' | 'afterAHF';
  dpf: number;
  thdi: number;
  distortionPF: number;
  truePF: number;
  estimatedPenalty: number;
}

interface InputsPayload {
  units: number;
  kva: number;
  dpf: number;
  penalty: number;
  thdi: number;
}

function ipFromRequest(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isValidScenarios(arr: unknown): arr is ScenarioPayload[] {
  if (!Array.isArray(arr) || arr.length !== 3) return false;
  const labels = new Set(['now', 'afterAPFC', 'afterAHF']);
  return arr.every(s =>
    s && typeof s === 'object'
    && labels.has((s as ScenarioPayload).label)
    && typeof (s as ScenarioPayload).truePF === 'number'
    && typeof (s as ScenarioPayload).estimatedPenalty === 'number'
  );
}

function isValidInputs(o: unknown): o is InputsPayload {
  if (!o || typeof o !== 'object') return false;
  const i = o as InputsPayload;
  return ['units', 'kva', 'dpf', 'penalty', 'thdi'].every(k => typeof (i as any)[k] === 'number' && isFinite((i as any)[k]));
}

export async function POST(req: NextRequest) {
  const ip = ipFromRequest(req);

  // 20 submissions / IP / minute is plenty for legitimate use; blocks dumb spam.
  const rl = rateLimit(`true-pf:${ip}`, 20);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!isValidInputs(body?.inputs) || !isValidScenarios(body?.scenarios)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const email: string | null = body.email && typeof body.email === 'string' && isValidEmail(body.email)
    ? body.email.trim().toLowerCase()
    : null;

  const ipHash = ip === 'unknown' ? null : crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32);
  const userAgent = req.headers.get('user-agent')?.slice(0, 256) || null;

  try {
    const row = await prisma.leadMagnetSubmission.create({
      data: {
        sourceTool: 'true-pf',
        email,
        inputJson: JSON.stringify(body.inputs),
        scenariosJson: JSON.stringify(body.scenarios),
        ipHash,
        userAgent,
        pdfRequested: !!email,
      },
    });

    const origin = req.headers.get('origin') || `https://${req.headers.get('host')}`;
    return NextResponse.json({
      shareToken: row.shareToken,
      shareUrl: `${origin}/tools/true-pf?r=${row.shareToken}`,
    }, { status: 201 });
  } catch (err) {
    console.error('[true-pf/share] create failed', err);
    // Persistence failure should not break the user — return a soft error.
    return NextResponse.json({ error: 'Could not save', shareToken: null }, { status: 200 });
  }
}
