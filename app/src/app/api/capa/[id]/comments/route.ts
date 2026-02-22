import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const body = await request.json();
  if (!body.comment) return NextResponse.json({ error: 'Comment is required' }, { status: 400 });

  const comment = await prisma.cAPAComment.create({
    data: { capaId: params.id, userId: result.user.id, comment: body.comment },
    include: { user: { select: { name: true } } },
  });
  return NextResponse.json(comment, { status: 201 });
}
