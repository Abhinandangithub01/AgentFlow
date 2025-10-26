import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.labels',
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: JSON.stringify({
        userId: session.user.sub,
        returnUrl: request.nextUrl.searchParams.get('returnUrl') || '/dashboard',
      }),
      prompt: 'consent',
    });

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('Gmail OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Gmail OAuth', details: error.message },
      { status: 500 }
    );
  }
}
