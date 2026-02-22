import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string | null;
  orgRole: string | null;
  activeClientId: string | null;
  activeClientSlug: string | null;
  activeClientName: string | null;
  clientRole: string | null;
}

/** Get the authenticated session with typed user */
export async function getSession(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as unknown as SessionUser;
}

/** Get session and require an active client. Returns 401/403 response if not available. */
export async function requireClient(): Promise<{ user: SessionUser; clientId: string } | { error: Response }> {
  const user = await getSession();
  if (!user) return { error: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
  if (!user.activeClientId) return { error: new Response(JSON.stringify({ error: 'No active client selected' }), { status: 403, headers: { 'Content-Type': 'application/json' } }) };
  return { user, clientId: user.activeClientId };
}
