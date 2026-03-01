import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/** POST — self-service consultant registration */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, companyName, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate unique org slug
    const baseSlug = (companyName || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Create Organization first
    const org = await prisma.organization.create({
      data: {
        name: companyName || `${name}'s Organization`,
        slug,
      },
    });

    // Create User + Membership (OWNER)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        memberships: {
          create: { organizationId: org.id, role: 'OWNER' },
        },
      },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
