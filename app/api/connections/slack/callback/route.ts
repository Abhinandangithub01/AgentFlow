import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { tokenVault } from '@/lib/improved-token-manager';
import DynamoDBService, { TABLES } from '@/lib/db/dynamodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard?error=missing_params', request.url)
      );
    }

    const stateData = JSON.parse(state);
    const { userId, returnUrl } = stateData;

    if (userId !== session.user.sub) {
      return NextResponse.redirect(
        new URL('/dashboard?error=user_mismatch', request.url)
      );
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.SLACK_REDIRECT_URI!,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      throw new Error(tokenData.error || 'Failed to get Slack token');
    }

    // Store tokens
    await tokenVault.storeOAuthToken(
      userId,
      'slack',
      {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || '',
        tokenType: 'Bearer',
        scope: tokenData.scope || '',
      }
    );

    // Store connection record
    await DynamoDBService.put(TABLES.CONNECTIONS, {
      PK: `USER#${userId}`,
      SK: 'SERVICE#slack',
      id: `conn_slack_${Date.now()}`,
      userId,
      service: 'slack',
      status: 'connected',
      teamId: tokenData.team?.id,
      teamName: tokenData.team?.name,
      scopes: tokenData.scope?.split(',') || [],
      connectedAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    });

    return NextResponse.redirect(
      new URL(`${returnUrl}?success=slack_connected`, request.url)
    );
  } catch (error: any) {
    console.error('Slack OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
