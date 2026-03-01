import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user || !user.isActive) return null;

      const valid = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!valid) return null;

      // Look up organization membership
      const membership = await prisma.membership.findFirst({
        where: { userId: user.id },
        include: { organization: true },
      });

      // Look up client access — pick first active client
      const clientAccess = await prisma.clientAccess.findFirst({
        where: { userId: user.id, client: { isActive: true } },
        include: { client: true },
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: membership?.organizationId || null,
        orgRole: membership?.role || null,
        activeClientId: clientAccess?.clientId || null,
        activeClientSlug: clientAccess?.client?.slug || null,
        activeClientName: clientAccess?.client?.name || null,
        clientRole: clientAccess?.role || null,
      };
    },
  }),
];

// Add Google OAuth if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth — ensure user exists in our DB
      if (account?.provider === 'google' && user.email) {
        let dbUser = await prisma.user.findUnique({ where: { email: user.email } });
        if (!dbUser) {
          // Auto-create user + organization for new Google sign-ups
          const baseSlug = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const slug = `${baseSlug}-${Date.now().toString(36)}`;

          const org = await prisma.organization.create({
            data: {
              name: `${user.name || 'My'}'s Organization`,
              slug,
            },
          });

          dbUser = await prisma.user.create({
            data: {
              name: user.name || 'User',
              email: user.email,
              passwordHash: '', // No password for OAuth users
              memberships: {
                create: { organizationId: org.id, role: 'OWNER' },
              },
            },
          });
        }
        if (!dbUser.isActive) return false;
      }
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        if (account?.provider === 'google') {
          // For Google users, look up full data from DB
          const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
          if (dbUser) {
            const membership = await prisma.membership.findFirst({
              where: { userId: dbUser.id },
              include: { organization: true },
            });
            const clientAccess = await prisma.clientAccess.findFirst({
              where: { userId: dbUser.id, client: { isActive: true } },
              include: { client: true },
            });

            token.id = dbUser.id;
            token.role = dbUser.role;
            token.organizationId = membership?.organizationId || null;
            token.orgRole = membership?.role || null;
            token.activeClientId = clientAccess?.clientId || null;
            token.activeClientSlug = clientAccess?.client?.slug || null;
            token.activeClientName = clientAccess?.client?.name || null;
            token.clientRole = clientAccess?.role || null;
          }
        } else {
          // Credentials — user object already has all data from authorize()
          token.id = user.id;
          token.role = (user as any).role;
          token.organizationId = (user as any).organizationId;
          token.orgRole = (user as any).orgRole;
          token.activeClientId = (user as any).activeClientId;
          token.activeClientSlug = (user as any).activeClientSlug;
          token.activeClientName = (user as any).activeClientName;
          token.clientRole = (user as any).clientRole;
        }
      }
      // Handle workspace switching via useSession().update()
      if (trigger === 'update' && session) {
        if (session.activeClientId) {
          token.activeClientId = session.activeClientId;
          token.activeClientSlug = session.activeClientSlug;
          token.activeClientName = session.activeClientName;
          token.clientRole = session.clientRole;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).organizationId = token.organizationId;
        (session.user as any).orgRole = token.orgRole;
        (session.user as any).activeClientId = token.activeClientId;
        (session.user as any).activeClientSlug = token.activeClientSlug;
        (session.user as any).activeClientName = token.activeClientName;
        (session.user as any).clientRole = token.clientRole;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};
