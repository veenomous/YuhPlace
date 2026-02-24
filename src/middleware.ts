import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { searchParams, pathname } = request.nextUrl;

  // Intercept auth callback params from Supabase email links
  // When Supabase redirects after email confirmation/recovery, it lands on the
  // root URL with ?code=X or ?token_hash=X&type=Y — route these to our callback
  if (pathname !== '/api/auth/callback') {
    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');

    if (code || tokenHash) {
      const callbackUrl = request.nextUrl.clone();
      callbackUrl.pathname = '/api/auth/callback';
      return NextResponse.redirect(callbackUrl);
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
