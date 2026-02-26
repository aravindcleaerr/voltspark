import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import crypto from 'crypto';

/**
 * Shareable View Management API (authenticated)
 * GET — list shareable views for current client
 * POST — create new shareable view
 * PATCH — toggle active/inactive
 */
export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  const views = await prisma.shareableView.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ views });
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  const body = await request.json();

  // Toggle active
  if (body.viewId && body.toggleActive !== undefined) {
    const view = await prisma.shareableView.update({
      where: { id: body.viewId },
      data: { isActive: body.toggleActive },
    });
    return NextResponse.json(view);
  }

  // Create new shareable view
  const token = crypto.randomBytes(24).toString('hex');
  const view = await prisma.shareableView.create({
    data: {
      clientId,
      token,
      title: body.title || 'Compliance Dashboard',
      sections: body.sections ? JSON.stringify(body.sections) : null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  });

  return NextResponse.json(view, { status: 201 });
}
