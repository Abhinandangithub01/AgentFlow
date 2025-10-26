import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const clientId = process.env.SLACK_CLIENT_ID;
    const redirectUri = process.env.SLACK_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      throw new Error('Slack OAuth not configured');
    }

    const scopes = [
      'chat:write',
      'channels:read',
      'channels:history',
      'users:read',
      'team:read',
    ].join(',');

    const state = JSON.stringify({
      userId: session.user.sub,
      returnUrl: request.nextUrl.searchParams.get('returnUrl') || '/dashboard',
    });

    const authUrl = new URL('https://slack.com/oauth/v2/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('Slack OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Slack OAuth', details: error.message },
      { status: 500 }
    );
  }
}
