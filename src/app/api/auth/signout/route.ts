import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

function getRequestOrigin(request: NextRequest): string {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}`;
}

export async function POST(request: NextRequest) {
  await clearSessionCookie();
  const origin = getRequestOrigin(request);
  return NextResponse.redirect(new URL('/', origin), { status: 303 });
}

export async function GET(request: NextRequest) {
  await clearSessionCookie();
  const origin = getRequestOrigin(request);
  return NextResponse.redirect(new URL('/', origin), { status: 303 });
}
