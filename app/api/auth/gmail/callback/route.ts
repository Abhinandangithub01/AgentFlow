import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { google } from 'googleapis';
import { tokenVault } from '@/lib/improved-token-manager';
import DynamoDBService, { TABLES } from '@/lib/db/dynamodb';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Gmail OAuth callback handler
export async function GET(request: NextRequest) {
  try {
    console.log('Gmail OAuth Callback - Starting');
    
    const session = await getSession();
    
    if (!session?.user) {
      console.error('No session found');
      return NextResponse.redirect(new URL('/?error=no_session', request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Log OAuth error if present
    if (error) {
      console.error('Gmail OAuth Error:', { error, errorDescription });
      return NextResponse.redirect(
        new URL(`/auth/callback?error=oauth_error`, request.url)
      );
    }

    if (!code) {
      console.error('No authorization code received');
      return NextResponse.redirect(
        new URL('/auth/callback?error=no_code', request.url)
      );
    }

    // Build redirect URI dynamically (must match the one used in connect route)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    process.env.AUTH0_BASE_URL || 
                    `https://${request.headers.get('host')}`;
    const redirectUri = `${baseUrl}/api/auth/gmail/callback`;

    console.log('Gmail OAuth Config:', {
      clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 30) + '...',
      redirectUri,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    });

    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      console.error('No access token received');
      throw new Error('No access token received from Google');
    }

    console.log('Gmail tokens received successfully');

    // Store tokens using improved token manager
    try {
      await tokenVault.storeOAuthToken(
        session.user.sub,
        'gmail',
        {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || '',
          expiresAt: tokens.expiry_date || undefined,
          tokenType: 'Bearer',
          scope: tokens.scope || '',
        }
      );
      console.log('[Gmail OAuth] ✅ Tokens stored securely');
    } catch (error: any) {
      console.log('[Gmail OAuth] ⚠️ Token storage failed:', error.message);
    }

    // Store connection record (skip if AWS not configured - local dev)
    try {
      await DynamoDBService.put(TABLES.CONNECTIONS, {
        PK: `USER#${session.user.sub}`,
        SK: 'SERVICE#gmail',
        id: `conn_gmail_${Date.now()}`,
        userId: session.user.sub,
        service: 'gmail',
        status: 'connected',
        scopes: tokens.scope?.split(' ') || [],
        connectedAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      });
      console.log('Connection record stored in DynamoDB');
    } catch (error: any) {
      console.log('DynamoDB storage skipped (local dev):', error.message);
    }

    // Redirect to callback page with success parameter
    // Prioritize environment variable for production (Amplify)
    const successBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                           process.env.AUTH0_BASE_URL ||
                           request.url;
    
    const successRedirectUrl = new URL('/auth/callback?connected=gmail', successBaseUrl);
    
    return NextResponse.redirect(successRedirectUrl);

  } catch (error: any) {
    console.error('Gmail OAuth callback error:', {
      message: error.message,
      stack: error.stack,
      error,
    });
    
    // Redirect to callback page with error parameter
    const errorBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                         process.env.AUTH0_BASE_URL ||
                         request.url;
    
    const errorRedirectUrl = new URL(
      `/auth/callback?error=callback_failed`,
      errorBaseUrl
    );
    
    return NextResponse.redirect(errorRedirectUrl);
  }
}
