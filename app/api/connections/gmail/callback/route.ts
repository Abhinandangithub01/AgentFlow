import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { google } from 'googleapis';
import DynamoDBService, { TABLES } from '@/lib/db/dynamodb';
import { cookies } from 'next/headers';

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

    // Verify user matches
    if (userId !== session.user.sub) {
      return NextResponse.redirect(
        new URL('/dashboard?error=user_mismatch', request.url)
      );
    }

    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    // Store tokens in DynamoDB for persistence
    // Note: In production, consider using Auth0's Management API to store tokens
    // For now, we'll use DynamoDB but with better structure
    await DynamoDBService.put(TABLES.TOKENS, {
      PK: `USER#${userId}`,
      SK: 'TOKEN#gmail',
      service: 'gmail',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || '',
      expiresAt: tokens.expiry_date,
      scope: tokens.scope || '',
      tokenType: 'Bearer',
      updatedAt: new Date().toISOString(),
    });
    
    console.log('[Gmail OAuth] ✅ Tokens stored securely in DynamoDB');

    // Store connection record
    await DynamoDBService.put(TABLES.CONNECTIONS, {
      PK: `USER#${userId}`,
      SK: 'SERVICE#gmail',
      id: `conn_gmail_${Date.now()}`,
      userId,
      service: 'gmail',
      status: 'connected',
      scopes: tokens.scope?.split(' ') || [],
      connectedAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    });

    // Redirect back to dashboard
    return NextResponse.redirect(
      new URL(`${returnUrl}?success=gmail_connected`, request.url)
    );
  } catch (error: any) {
    console.error('Gmail OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
