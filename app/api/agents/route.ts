import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

// Mock data for MVP - replace with database in production
const mockAgents = [
  {
    id: '1',
    name: 'Email Assistant',
    type: 'email',
    status: 'active',
    lastRun: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    actionsToday: 34,
    description: 'Manages inbox and drafts replies',
    config: {
      schedule: 'hourly',
      services: ['gmail', 'slack']
    }
  },
  {
    id: '2',
    name: 'Invoice Tracker',
    type: 'finance',
    status: 'active',
    lastRun: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    actionsToday: 3,
    description: 'Tracks payments and sends reminders',
    config: {
      schedule: 'daily',
      services: ['freshbooks', 'gmail']
    }
  },
  {
    id: '3',
    name: 'Research Agent',
    type: 'research',
    status: 'paused',
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    actionsToday: 0,
    description: 'Monitors industry news and trends',
    config: {
      schedule: 'daily',
      services: ['web']
    }
  }
];

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, fetch agents from database filtered by user ID
    const userAgents = mockAgents;

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

    // In production, save to database
    const newAgent = {
      id: String(Date.now()),
      name,
      type,
      status: 'paused',
      lastRun: new Date().toISOString(),
      actionsToday: 0,
      description,
      config: config || { schedule: 'daily', services: [] }
    };

    return NextResponse.json({ agent: newAgent }, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
