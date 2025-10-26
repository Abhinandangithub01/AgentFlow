import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { agentManager } from '@/lib/agent-manager';

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

    console.log('[API] Fetching agent:', agentId, 'for user:', session.user.sub);

    // Fetch agent from agent manager
    const agent = await agentManager.getAgent(agentId, session.user.sub);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

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

    console.log('[API] Updating agent:', agentId, 'with:', body);

    // Update agent status
    if (body.status) {
      const agent = body.status === 'active' 
        ? await agentManager.startAgent(agentId, session.user.sub)
        : await agentManager.pauseAgent(agentId, session.user.sub);
      
      return NextResponse.json({ agent });
    }

    // For other updates, fetch and update manually
    const agent = await agentManager.getAgent(agentId, session.user.sub);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const updatedAgent = {
      ...agent,
      ...body,
      updatedAt: new Date().toISOString()
    };

    // Save updated agent
    if (typeof window === 'undefined') {
      global.agents = global.agents || new Map();
      global.agents.set(agentId, updatedAgent);
    }

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

    console.log('[API] Deleting agent:', agentId, 'for user:', session.user.sub);

    // Delete agent
    const success = await agentManager.deleteAgent(agentId, session.user.sub);

    if (!success) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: agentId });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
