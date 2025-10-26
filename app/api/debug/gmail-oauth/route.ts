import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// TEMPORARY DEBUG ENDPOINT - DELETE AFTER FIXING
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const baseUrl = searchParams.get('baseUrl') || 
                    process.env.NEXT_PUBLIC_APP_URL || 
                    process.env.AUTH0_BASE_URL ||
                    'https://main.d13aenlm5qrdln.amplifyapp.com';
    
    const redirectUri = `${baseUrl}/api/auth/gmail/callback`;
    
    const config: any = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
      redirectUri: redirectUri,
      baseUrl: baseUrl,
      
      // Show first/last chars only for security
      clientIdPreview: process.env.GOOGLE_CLIENT_ID 
        ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 15)}...${process.env.GOOGLE_CLIENT_ID.substring(process.env.GOOGLE_CLIENT_ID.length - 25)}`
        : 'MISSING',
      
      // Environment variables
      envVars: {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
        GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'NOT SET (using dynamic)',
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
        AUTH0_BASE_URL: process.env.AUTH0_BASE_URL || 'NOT SET',
      },
      
      // Check if OAuth URL can be generated
      canGenerateAuthUrl: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    };
    
    // Try to generate auth URL
    let authUrlTest = null;
    let authUrlError = null;
    
    if (config.canGenerateAuthUrl) {
      try {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          redirectUri
        );
        
        authUrlTest = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: ['https://www.googleapis.com/auth/gmail.readonly'],
          prompt: 'consent',
        });
        
        // Parse the URL to show params
        const testUrl = new URL(authUrlTest);
        config.authUrlParams = {
          client_id: testUrl.searchParams.get('client_id'),
          redirect_uri: testUrl.searchParams.get('redirect_uri'),
          scope: testUrl.searchParams.get('scope'),
          access_type: testUrl.searchParams.get('access_type'),
        };
      } catch (error: any) {
        authUrlError = error.message;
      }
    }
    
    return NextResponse.json({
      status: 'Gmail OAuth Configuration Debug',
      timestamp: new Date().toISOString(),
      config,
      authUrlTest: authUrlTest ? 'Generated successfully' : authUrlError || 'Cannot generate',
      authUrlError,
      
      nextSteps: [
        '1. Verify GOOGLE_CLIENT_ID in Amplify matches Google Cloud Console',
        '2. Ensure OAuth 2.0 Client exists in Google Cloud Console',
        '3. Check redirect URI matches exactly',
        '4. Confirm Gmail API is enabled',
      ],
      
      googleCloudConsoleChecklist: {
        step1: 'Go to https://console.cloud.google.com/apis/credentials',
        step2: 'Check if OAuth 2.0 Client ID exists with the client_id shown above',
        step3: 'If NOT exists, click "CREATE CREDENTIALS" → "OAuth client ID"',
        step4: 'Set redirect URI to: ' + redirectUri,
        step5: 'Enable Gmail API at https://console.cloud.google.com/apis/library/gmail.googleapis.com',
      }
    }, { status: 200 });
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug endpoint error',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
