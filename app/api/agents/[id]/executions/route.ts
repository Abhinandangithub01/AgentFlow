import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import DynamoDBService, { TABLES } from '@/lib/db/dynamodb';

// Get execution history for an agent
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = params.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status'); // completed, failed, in_progress

    // Get all executions for this agent
    const executions = await DynamoDBService.query(
      TABLES.EXECUTIONS,
      'PK = :pk AND begins_with(SK, :sk)',
      {
        ':pk': `AGENT#${agentId}`,
        ':sk': 'PLAN#',
      }
    );

    // Filter by status if provided
    let filtered = executions;
    if (status) {
      filtered = executions.filter(e => e.status === status);
    }

    // Sort by creation date (newest first)
    const sorted = filtered
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    // Calculate statistics
    const stats = {
      total: executions.length,
      completed: executions.filter(e => e.status === 'completed').length,
      failed: executions.filter(e => e.status === 'failed').length,
      inProgress: executions.filter(e => e.status === 'in_progress').length,
      cancelled: executions.filter(e => e.status === 'cancelled').length,
    };

    return NextResponse.json({
      executions: sorted,
      stats,
      count: sorted.length,
    });
  } catch (error: any) {
    console.error('Get executions error:', error);
    return NextResponse.json(
      { error: 'Failed to get executions', details: error.message },
      { status: 500 }
    );
  }
}
