import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

// Debug endpoint to check environment variables
// REMOVE THIS IN PRODUCTION!
export async function GET() {
  try {
    const session = await getSession();
    
    // Only allow authenticated users
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check which environment variables are set
    const envCheck = {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI ? 'SET' : 'MISSING',
      AUTH0_SECRET: process.env.AUTH0_SECRET ? 'SET' : 'MISSING',
      AUTH0_BASE_URL: process.env.AUTH0_BASE_URL || 'MISSING',
      AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL || 'MISSING',
      GROQ_API_KEY: process.env.GROQ_API_KEY ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV || 'MISSING',
    };

    // Show partial values for debugging (first 20 chars only)
    const envValues = {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID?.substring(0, 30) + '...' || 'MISSING',
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'MISSING',
      AUTH0_BASE_URL: process.env.AUTH0_BASE_URL || 'MISSING',
    };

    return NextResponse.json({
      message: 'Environment variables check',
      status: envCheck,
      partialValues: envValues,
      allEnvVarsCount: Object.keys(process.env).length,
    });
  } catch (error) {
    console.error('Error checking environment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
