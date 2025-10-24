import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = params.id;

    // Mock agent data - replace with database query
    const agent = {
      id: agentId,
      name: 'Email Assistant',
      type: 'email',
      status: 'active',
      lastRun: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      actionsToday: 34,
      description: 'Manages inbox and drafts replies',
      config: {
        schedule: 'hourly',
        services: ['gmail', 'slack']
      },
      stats: {
        totalActions: 1247,
        successRate: 98,
        timeSaved: 42.5,
        emailsProcessed: 847,
        draftsCreated: 234
      }
    };

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = params.id;
    const body = await request.json();

    // In production, update database
    const updatedAgent = {
      id: agentId,
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ agent: updatedAgent });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = params.id;

    // In production, delete from database
    return NextResponse.json({ success: true, id: agentId });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
