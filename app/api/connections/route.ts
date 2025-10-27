import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import DynamoDBService, { TABLES } from '@/lib/db/dynamodb';
import { tokenVault } from '@/lib/token-vault';

// Get all connections for user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let connections: any[] = [];

    console.log('[Connections API] Fetching connections for user:', session.user.sub);

    // Try DynamoDB first
    try {
      connections = await DynamoDBService.query(
        TABLES.CONNECTIONS,
        'PK = :pk AND begins_with(SK, :sk)',
        { 
          ':pk': `USER#${session.user.sub}`,
          ':sk': 'SERVICE#'
        }
      );
      console.log('[Connections API] DynamoDB returned:', connections.length, 'connections');
    } catch (dbError: any) {
      console.log('[Connections API] DynamoDB error:', dbError.message);
    }

    // Always check Token Vault as well (for redundancy)
    console.log('[Connections API] Checking Token Vault for all services...');
    const services = ['gmail', 'slack', 'google-calendar', 'notion', 'twitter', 'linkedin'];
    const vaultConnections = [];

    for (const service of services) {
      try {
        const token = await tokenVault.getOAuthToken(session.user.sub, service);
        console.log(`[Connections API] ${service}: token exists =`, !!token, ', has accessToken =', !!token?.accessToken);
        if (token && token.accessToken) {
          // Check if already in connections from DynamoDB
          const existsInDB = connections.some(c => c.service === service);
          if (!existsInDB) {
            vaultConnections.push({
              id: `${session.user.sub}-${service}`,
              service: service,
              status: 'connected',
              scopes: [],
              connectedAt: new Date().toISOString(),
              lastUsed: new Date().toISOString(),
            });
            console.log(`[Connections API] Added ${service} from Token Vault`);
          }
        }
      } catch (err: any) {
        console.log(`[Connections API] Error checking ${service}:`, err.message);
      }
    }

    // Merge connections from both sources
    connections = [...connections, ...vaultConnections];
    console.log(`[Connections API] Total connections: ${connections.length}`);

    // Don't expose tokens
    const safeConnections = connections.map(conn => ({
      id: conn.id,
      service: conn.service,
      status: conn.status,
      scopes: conn.scopes,
      connectedAt: conn.connectedAt,
      lastUsed: conn.lastUsed,
    }));

    return NextResponse.json({ connections: safeConnections });
  } catch (error: any) {
    console.error('Get connections error:', error);
    return NextResponse.json(
      { error: 'Failed to get connections', details: error.message },
      { status: 500 }
    );
  }
}

// Delete connection
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');

    if (!service) {
      return NextResponse.json({ error: 'Service is required' }, { status: 400 });
    }

    // Revoke tokens
    await tokenVault.revokeToken(session.user.sub, service);

    // Delete connection record
    await DynamoDBService.delete(TABLES.CONNECTIONS, {
      PK: `USER#${session.user.sub}`,
      SK: `SERVICE#${service}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete connection error:', error);
    return NextResponse.json(
      { error: 'Failed to delete connection', details: error.message },
      { status: 500 }
    );
  }
}
