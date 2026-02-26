import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/energy-sources/:path*',
    '/consumption/:path*',
    '/targets/:path*',
    '/training/:path*',
    '/audits/:path*',
    '/capa/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/console/:path*',
    '/costs/:path*',
    '/compliance/:path*',
    '/safety/:path*',
    '/utility-bills/:path*',
    '/calendar/:path*',
    '/savings/:path*',
    '/roi/:path*',
    '/action-plans/:path*',
    '/documents/:path*',
    '/notifications/:path*',
    '/schemes/:path*',
    '/analytics/:path*',
    '/share',
  ],
};
