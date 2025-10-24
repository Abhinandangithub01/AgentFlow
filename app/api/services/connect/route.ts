import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getGmailAuthUrl } from '@/lib/gmail';

// OAuth connection handler
export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { service } = body;

    // Validate service
    const allowedServices = ['gmail', 'slack', 'google calendar', 'notion', 'twitter', 'linkedin'];
    if (!allowedServices.includes(service.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid service' }, { status: 400 });
    }

    // Handle Gmail OAuth
    if (service.toLowerCase() === 'gmail') {
      const authUrl = getGmailAuthUrl();
      
      return NextResponse.json({ 
        success: true,
        requiresOAuth: true,
        authUrl,
        service: 'gmail',
        message: 'Redirect to Google OAuth',
        scopes: [
          'gmail.readonly',
          'gmail.send',
          'gmail.modify',
          'gmail.labels'
        ]
      });
    }

    // For other services, simulate connection
    const connection = {
      id: `conn_${Date.now()}`,
      userId: session.user.sub,
      service: service.toLowerCase(),
      status: 'connected',
      scopes: getServiceScopes(service),
      connectedAt: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true, 
      connection,
      message: `${service} connected successfully`
    });
  } catch (error) {
    console.error('Error connecting service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getServiceScopes(service: string): string[] {
  const scopeMap: Record<string, string[]> = {
    gmail: ['gmail.readonly', 'gmail.send', 'gmail.modify'],
    slack: ['chat:write', 'channels:read', 'users:read'],
    freshbooks: ['invoices:read', 'clients:read'],
    calendar: ['calendar.readonly', 'calendar.events'],
    twitter: ['tweet.read', 'tweet.write', 'users.read'],
    linkedin: ['r_liteprofile', 'w_member_social']
  };
  
  return scopeMap[service.toLowerCase()] || [];
}

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, fetch from database
    const connections = [
      {
        id: 'conn_1',
        service: 'gmail',
        status: 'connected',
        scopes: ['gmail.readonly', 'gmail.send']
      }
    ];

    return NextResponse.json({ connections });
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
