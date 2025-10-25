import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { agentManager } from '@/lib/agent-manager';
import { AgentType } from '@/types/agent';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch agents using agent manager
    const userAgents = await agentManager.listAgents(session.user.sub);

    return NextResponse.json({ agents: userAgents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, description, config } = body;

    // Validate input
    if (!name || !type || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create agent using agent manager
    const newAgent = await agentManager.createAgent(
      session.user.sub,
      name,
      type as AgentType,
      config || {}
    );

    return NextResponse.json({ agent: newAgent }, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
