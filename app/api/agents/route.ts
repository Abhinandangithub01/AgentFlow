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

    console.log('[API] Fetching agents for user:', session.user.sub);

    // Fetch agents using agent manager
    const userAgents = await agentManager.listAgents(session.user.sub);

    console.log('[API] Found agents:', userAgents.length);

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

    console.log('[API] Creating agent:', { name, type, description, config });

    // Validate input
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: name and type' },
        { status: 400 }
      );
    }

    // Create agent using agent manager with description in config
    const agentConfig = {
      ...config,
      systemPrompt: description || `AI agent for ${type}`,
    };

    const newAgent = await agentManager.createAgent(
      session.user.sub,
      name,
      type as AgentType,
      agentConfig
    );

    console.log('[API] Agent created:', newAgent);

    return NextResponse.json({ agent: newAgent }, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
