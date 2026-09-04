import { NextRequest, NextResponse, after } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { createSession } from '@/lib/auth';
import { adoptPendingPlan } from '@/lib/pending-plan';
import { pushSignupToCrm } from '@/lib/crm';

const STATE_COOKIE = 'google_oauth_state';
const SESSION_COOKIE = 'mercury_session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface GoogleProfile {
  sub: string;
  email: string;
  name?: string;
}

function getRequestOrigin(request: NextRequest): string {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const oauthError = searchParams.get('error');
  const origin = getRequestOrigin(request);

  if (oauthError || !code) {
    console.error('Google OAuth error from query parameters:', oauthError);
    return NextResponse.redirect(new URL(`/sign-in?error=google_auth_failed&details=${encodeURIComponent(oauthError || 'missing_auth_code')}`, origin));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL('/sign-in?error=google_not_configured', origin));
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error('Google token exchange failed:', errorText);
      return NextResponse.redirect(new URL(`/sign-in?error=google_auth_failed&details=${encodeURIComponent(errorText)}`, origin));
    }

    const tokens: { access_token: string } = await tokenRes.json();

    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!userInfoRes.ok) {
      throw new Error('Failed to fetch Google user info');
    }
    const profile: GoogleProfile = await userInfoRes.json();

    let [user] = await db.select().from(users).where(eq(users.googleId, profile.sub)).limit(1);

    if (!user) {
      const [byEmail] = await db.select().from(users).where(eq(users.email, profile.email)).limit(1);
      if (byEmail) {
        [user] = await db
          .update(users)
          .set({ googleId: profile.sub, name: byEmail.name ?? profile.name ?? null })
          .where(eq(users.id, byEmail.id))
          .returning();
      } else {
        [user] = await db
          .insert(users)
          .values({ email: profile.email, googleId: profile.sub, name: profile.name ?? null })
          .returning();
        after(() => pushSignupToCrm({ name: user.name, email: user.email }, 'GOOGLE'));
      }
    }

    await adoptPendingPlan(user.id);
    const sessionId = await createSession(user.id);
    const response = NextResponse.redirect(new URL('/account', origin));

    // Delete the state cookie
    response.cookies.delete(STATE_COOKIE);

    // Set the session cookie directly on the NextResponse object so it is sent in the headers
    response.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(Date.now() + SESSION_DURATION_MS),
    });

    return response;
  } catch (err) {
    console.error('Google OAuth callback handler error:', err);
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.redirect(new URL(`/sign-in?error=google_auth_failed&details=${encodeURIComponent(errMsg)}`, origin));
  }
}
