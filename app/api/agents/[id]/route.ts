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
    const userId = session.user.sub;

    console.log('[API GET] Fetching agent:', agentId, 'for user:', userId);

    // Fetch agent from agent manager
    const agent = await agentManager.getAgent(agentId, userId);

    if (!agent) {
      console.log('[API GET] Agent not found:', agentId);
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    console.log('[API GET] Agent found:', agent.name, 'status:', agent.status);

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
    const userId = session.user.sub;
    const body = await request.json();

    console.log('[API PATCH] Updating agent:', agentId, 'for user:', userId, 'with:', body);

    // Update agent status
    if (body.status) {
      console.log('[API PATCH] Updating status to:', body.status);
      const agent = body.status === 'active' 
        ? await agentManager.startAgent(agentId, userId)
        : await agentManager.pauseAgent(agentId, userId);
      
      console.log('[API PATCH] Status updated successfully');
      return NextResponse.json({ agent });
    }

    // For other updates, use agent manager
    const agent = await agentManager.getAgent(agentId, userId);
    if (!agent) {
      console.log('[API PATCH] Agent not found:', agentId);
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Update agent fields
    Object.assign(agent, body);
    agent.updatedAt = new Date().toISOString();

    // Save using agent manager (will save to DynamoDB)
    await agentManager.saveAgent(agent);

    console.log('[API PATCH] Agent updated successfully');
    return NextResponse.json({ agent });
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
    const userId = session.user.sub;

    console.log('[API DELETE] Deleting agent:', agentId, 'for user:', userId);

    // Delete agent
    const success = await agentManager.deleteAgent(agentId, userId);

    if (!success) {
      console.log('[API DELETE] Agent not found:', agentId);
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    console.log('[API DELETE] Agent deleted successfully');

    return NextResponse.json({ success: true, id: agentId });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
