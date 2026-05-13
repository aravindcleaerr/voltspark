import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomBytes, createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendEmail, passwordResetEmail } from '@/lib/email';

const schema = z.object({ email: z.string().email() });
const EXPIRY_HOURS = 1;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  // Always return success to avoid email enumeration — never reveal whether
  // the address is registered.
  if (!parsed.success) return NextResponse.json({ ok: true });

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, isActive: true } });

  if (user && user.isActive) {
    // Generate a 32-byte token; hash before storing so a DB leak doesn't grant resets.
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.passwordResetToken.create({ data: { email, tokenHash, expiresAt } });

    const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'https://www.volt-spark.in';
    const resetUrl = `${origin}/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      ...passwordResetEmail({ name: user.name, resetUrl, expiryHours: EXPIRY_HOURS }),
    });
  }

  return NextResponse.json({ ok: true });
}
