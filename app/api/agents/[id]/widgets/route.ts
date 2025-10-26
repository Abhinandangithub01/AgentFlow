import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import DynamoDBService, { TABLES } from '@/lib/db/dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Get all widgets for an agent
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

    const widgets = await DynamoDBService.query(
      TABLES.AGENTS,
      'PK = :pk AND begins_with(SK, :sk)',
      {
        ':pk': `AGENT#${agentId}`,
        ':sk': 'WIDGET#',
      }
    );

    return NextResponse.json({ widgets });
  } catch (error: any) {
    console.error('Get widgets error:', error);
    return NextResponse.json(
      { error: 'Failed to get widgets', details: error.message },
      { status: 500 }
    );
  }
}

// Create a new widget
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = params.id;
    const body = await request.json();
    const { type, title, position, config } = body;

    if (!type || !title || !position) {
      return NextResponse.json(
        { error: 'Type, title, and position are required' },
        { status: 400 }
      );
    }

    const widgetId = `widget_${uuidv4()}`;
    const widget = {
      PK: `AGENT#${agentId}`,
      SK: `WIDGET#${widgetId}`,
      id: widgetId,
      agentId,
      userId: session.user.sub,
      type,
      title,
      position,
      config: config || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await DynamoDBService.put(TABLES.AGENTS, widget);

    return NextResponse.json({ widget }, { status: 201 });
  } catch (error: any) {
    console.error('Create widget error:', error);
    return NextResponse.json(
      { error: 'Failed to create widget', details: error.message },
      { status: 500 }
    );
  }
}

// Update widget
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = params.id;
    const body = await request.json();
    const { widgetId, position, config, title } = body;

    if (!widgetId) {
      return NextResponse.json({ error: 'Widget ID is required' }, { status: 400 });
    }

    const updateExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {
      ':updatedAt': new Date().toISOString(),
    };
    const expressionAttributeNames: Record<string, string> = {
      '#updatedAt': 'updatedAt',
    };

    if (position) {
      updateExpressions.push('#position = :position');
      expressionAttributeNames['#position'] = 'position';
      expressionAttributeValues[':position'] = position;
    }

    if (config) {
      updateExpressions.push('#config = :config');
      expressionAttributeNames['#config'] = 'config';
      expressionAttributeValues[':config'] = config;
    }

    if (title) {
      updateExpressions.push('#title = :title');
      expressionAttributeNames['#title'] = 'title';
      expressionAttributeValues[':title'] = title;
    }

    updateExpressions.push('#updatedAt = :updatedAt');

    const updatedWidget = await DynamoDBService.update(
      TABLES.AGENTS,
      { PK: `AGENT#${agentId}`, SK: `WIDGET#${widgetId}` },
      `SET ${updateExpressions.join(', ')}`,
      expressionAttributeValues,
      expressionAttributeNames
    );

    return NextResponse.json({ widget: updatedWidget });
  } catch (error: any) {
    console.error('Update widget error:', error);
    return NextResponse.json(
      { error: 'Failed to update widget', details: error.message },
      { status: 500 }
    );
  }
}

// Delete widget
export async function DELETE(
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
    const widgetId = searchParams.get('widgetId');

    if (!widgetId) {
      return NextResponse.json({ error: 'Widget ID is required' }, { status: 400 });
    }

    await DynamoDBService.delete(TABLES.AGENTS, {
      PK: `AGENT#${agentId}`,
      SK: `WIDGET#${widgetId}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete widget error:', error);
    return NextResponse.json(
      { error: 'Failed to delete widget', details: error.message },
      { status: 500 }
    );
  }
}
