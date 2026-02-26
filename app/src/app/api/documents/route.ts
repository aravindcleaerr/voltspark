import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  const category = request.nextUrl.searchParams.get('category');
  const linkedToType = request.nextUrl.searchParams.get('linkedToType');

  const where: Record<string, unknown> = { clientId };
  if (category) where.category = category;
  if (linkedToType) where.linkedToType = linkedToType;

  const documents = await prisma.document.findMany({
    where,
    include: { uploadedBy: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  // Group by category
  const byCategory: Record<string, number> = {};
  for (const doc of documents) {
    byCategory[doc.category] = (byCategory[doc.category] || 0) + 1;
  }

  return NextResponse.json({
    documents,
    summary: {
      total: documents.length,
      byCategory,
      totalSize: documents.reduce((s, d) => s + (d.fileSize || 0), 0),
    },
  });
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId, user } = result;

  const body = await request.json();
  const doc = await prisma.document.create({
    data: {
      clientId,
      name: body.name,
      category: body.category,
      fileUrl: body.fileUrl,
      fileSize: body.fileSize || null,
      mimeType: body.mimeType || null,
      linkedToType: body.linkedToType || null,
      linkedToId: body.linkedToId || null,
      description: body.description || null,
      uploadedById: user.id,
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
