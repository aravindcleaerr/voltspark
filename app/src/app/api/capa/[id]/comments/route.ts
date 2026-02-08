import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.comment) return NextResponse.json({ error: 'Comment is required' }, { status: 400 });

  const comment = await prisma.cAPAComment.create({
    data: { capaId: params.id, userId: (session.user as any).id, comment: body.comment },
    include: { user: { select: { name: true } } },
  });
  return NextResponse.json(comment, { status: 201 });
}
