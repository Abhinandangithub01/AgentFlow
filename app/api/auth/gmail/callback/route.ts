import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getGmailTokens } from '@/lib/gmail';

// Gmail OAuth callback handler
export async function GET(request: Request) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/integrations?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/integrations?error=no_code', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await getGmailTokens(code);

    // In production, store tokens in Auth0 Token Vault or secure database
    // For now, we'll store in session or database
    console.log('Gmail tokens received:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expiry_date,
    });

    // TODO: Store tokens securely
    // await storeTokens(session.user.sub, 'gmail', tokens);

    // Redirect back to integrations page with success
    return NextResponse.redirect(
      new URL('/integrations?connected=gmail', request.url)
    );

  } catch (error) {
    console.error('Gmail OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/integrations?error=callback_failed', request.url)
    );
  }
}
