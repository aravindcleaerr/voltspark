import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { serializeProfile, serializeTemplate } from '@/lib/acp';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const profile = await prisma.assetContextProfile.findFirst({
    where: { id: params.id, clientId: result.clientId },
    include: {
      energySource: { select: { id: true, name: true, type: true } },
      reviews: { orderBy: { section: 'asc' } },
    },
  });
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // The originating template, so the UI can show the design-intent defaults
  // alongside the tuned values.
  const template = await prisma.assetTemplate.findUnique({ where: { key: profile.templateKey } });

  return NextResponse.json({
    ...serializeProfile(profile),
    template: template ? serializeTemplate(template) : null,
    templateOutdated: template ? template.version !== profile.templateVersion : false,
  });
}

// Scalar fields the user may tune directly.
const SCALAR_FIELDS = [
  'name', 'manufacturer', 'model', 'yearInstalled', 'ratedPowerKw', 'criticality',
  'energySourceId', 'meteringMode', 'unitOfOutput', 'painCurrency', 'notes',
  'isActive', 'reconcileStatus', 'reconcileNote',
];
// Object/array fields stored as JSON strings — sent as objects, persisted stringified.
const JSON_FIELDS: Record<string, string> = {
  operatingEnvelope: 'operatingEnvelopeJson',
  activeKpis: 'activeKpisJson',
  failureModes: 'failureModesJson',
  reportAudiences: 'reportAudiencesJson',
};

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  const data: Record<string, unknown> = {};
  for (const k of SCALAR_FIELDS) if (k in body) data[k] = body[k];
  for (const [field, column] of Object.entries(JSON_FIELDS)) {
    if (field in body) data[column] = JSON.stringify(body[field]);
  }

  if (typeof data.yearInstalled === 'string') data.yearInstalled = data.yearInstalled ? Number(data.yearInstalled) : null;
  if (typeof data.ratedPowerKw === 'string') data.ratedPowerKw = data.ratedPowerKw ? Number(data.ratedPowerKw) : null;

  // A linked meter must belong to this client.
  if (data.energySourceId) {
    const src = await prisma.energySource.findFirst({
      where: { id: String(data.energySourceId), clientId: result.clientId },
      select: { id: true },
    });
    if (!src) return NextResponse.json({ error: 'Energy source not found' }, { status: 400 });
  } else if ('energySourceId' in data) {
    data.energySourceId = null;
  }

  const updated = await prisma.assetContextProfile.updateMany({
    where: { id: params.id, clientId: result.clientId },
    data,
  });
  if (updated.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const profile = await prisma.assetContextProfile.findUnique({
    where: { id: params.id },
    include: { energySource: { select: { id: true, name: true } } },
  });
  return NextResponse.json(profile ? serializeProfile(profile) : null);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const profile = await prisma.assetContextProfile.findFirst({
    where: { id: params.id, clientId: result.clientId },
    select: { id: true },
  });
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.contextReview.deleteMany({ where: { profileId: params.id } });
  await prisma.assetContextProfile.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
