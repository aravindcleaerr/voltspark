import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
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
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.organizationId = (user as any).organizationId;
        token.orgRole = (user as any).orgRole;
        token.activeClientId = (user as any).activeClientId;
        token.activeClientSlug = (user as any).activeClientSlug;
        token.activeClientName = (user as any).activeClientName;
        token.clientRole = (user as any).clientRole;
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
