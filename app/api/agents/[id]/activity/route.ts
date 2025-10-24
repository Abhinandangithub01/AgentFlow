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

    // Mock activity data - replace with database query
    const activities = [
      {
        id: '1',
        agentId,
        type: 'success',
        icon: '📧',
        title: 'Read 12 new emails from Gmail',
        description: '8 categorized as client work, 3 as newsletters, 1 flagged as urgent',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        details: {
          urgent: 1,
          client: 8,
          newsletter: 3
        }
      },
      {
        id: '2',
        agentId,
        type: 'info',
        icon: '✏️',
        title: 'Drafted reply to client@company.com',
        description: '"Hi John, regarding the invoice for Project X..."',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        details: {
          recipient: 'john@acme.com',
          confidence: 95,
          tone: 'Professional'
        }
      },
      {
        id: '3',
        agentId,
        type: 'action_required',
        icon: '⚠️',
        title: 'Needs Your Attention',
        description: 'Found urgent email from VIP client about deadline change',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        details: {
          subject: 'Project deadline moved to tomorrow',
          from: 'John Doe - Acme Corp'
        }
      },
      {
        id: '4',
        agentId,
        type: 'success',
        icon: '💬',
        title: 'Posted summary to #work-updates',
        description: 'Daily email digest shared with team',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        agentId,
        type: 'success',
        icon: '🔍',
        title: 'Scanned inbox for urgent items',
        description: 'No urgent items found. All caught up!',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ];

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
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

    // In production, save activity to database
    const newActivity = {
      id: String(Date.now()),
      agentId,
      ...body,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({ activity: newActivity }, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
