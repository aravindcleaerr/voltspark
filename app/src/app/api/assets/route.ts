import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { jsonParse, serializeProfile } from '@/lib/acp';

// List every Asset Context Profile for the active client.
export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const profiles = await prisma.assetContextProfile.findMany({
    where: { clientId: result.clientId },
    include: { energySource: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(profiles.map(serializeProfile));
}

const createSchema = z.object({
  templateKey: z.string().min(1),
  name: z.string().min(1).max(120),
  energySourceId: z.string().optional().nullable(),
  manufacturer: z.string().max(120).optional(),
  model: z.string().max(120).optional(),
  yearInstalled: z.number().int().min(1950).max(2100).optional(),
  ratedPowerKw: z.number().positive().max(100000).optional(),
  criticality: z.enum(['critical', 'important', 'standard', 'non-critical']).optional(),
});

// Onboard one real asset: pick a template, pre-fill the ACP from its
// design-intent defaults, then the user tunes it on the detail page.
export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  const input = parsed.data;

  const template = await prisma.assetTemplate.findUnique({ where: { key: input.templateKey } });
  if (!template) return NextResponse.json({ error: 'Unknown asset template' }, { status: 400 });

  // If a meter is linked, it must belong to this client.
  if (input.energySourceId) {
    const src = await prisma.energySource.findFirst({
      where: { id: input.energySourceId, clientId: result.clientId },
      select: { id: true },
    });
    if (!src) return NextResponse.json({ error: 'Energy source not found' }, { status: 400 });
  }

  // Pre-fill from template defaults.
  const powerStates = jsonParse(template.powerStatesJson, [] as unknown[]);
  const envelope = jsonParse(template.operatingEnvelopeJson, {} as Record<string, unknown>);
  const midpointKw =
    template.ratedPowerMinKw != null && template.ratedPowerMaxKw != null
      ? Math.round(((template.ratedPowerMinKw + template.ratedPowerMaxKw) / 2) * 10) / 10
      : null;

  const profile = await prisma.assetContextProfile.create({
    data: {
      clientId: result.clientId,
      name: input.name,
      templateKey: template.key,
      templateVersion: template.version,
      energySourceId: input.energySourceId || null,
      assetCategory: template.category,
      manufacturer: input.manufacturer || null,
      model: input.model || null,
      yearInstalled: input.yearInstalled ?? null,
      ratedPowerKw: input.ratedPowerKw ?? midpointKw,
      criticality: input.criticality ?? template.criticalityDefault,
      operatingEnvelopeJson: JSON.stringify({ powerStates, ...envelope }),
      unitOfOutput: 'part',
      painCurrency: 'cost',
      activeKpisJson: template.primaryKpisJson,
      failureModesJson: template.failureModesJson,
      reportAudiencesJson: JSON.stringify(['owner']),
      reconcileStatus: 'UNVERIFIED',
    },
    include: { energySource: { select: { id: true, name: true } } },
  });

  return NextResponse.json(serializeProfile(profile), { status: 201 });
}
