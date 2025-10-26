import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { OpenAI } from 'openai';
import { agentMemory } from '@/lib/memory/agent-memory';
import { ragSystem } from '@/lib/rag/rag-system';
import { rulesEngine } from '@/lib/rules/rules-engine';
import DynamoDBService, { TABLES } from '@/lib/db/dynamodb';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const { message, useRAG = true, useMemory = true, attachments = [] } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get agent configuration
    const agent = await DynamoDBService.get(TABLES.AGENTS, {
      PK: `USER#${session.user.sub}`,
      SK: `AGENT#${agentId}`,
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Check rules before processing
    const ruleEval = await rulesEngine.evaluateRules({
      agentId,
      input: { message },
      currentState: {
        timestamp: new Date().toISOString(),
        user: session.user.sub,
      },
    });

    if (ruleEval.shouldStop) {
      return NextResponse.json({
        error: 'Request blocked by agent rules',
        reason: ruleEval.actions.find(a => a.type === 'stop_execution')?.params.reason,
      }, { status: 403 });
    }

    // Retrieve context from memory
    let memoryContext = '';
    let memoriesRetrieved = 0;
    if (useMemory) {
      const memories = await agentMemory.retrieve({
        agentId,
        limit: 5,
        minImportance: 0.5,
      });
      memoriesRetrieved = memories.length;
      memoryContext = memories.map(m => m.content).join('\n');
    }

    // Query knowledge bases
    let ragContext = '';
    let ragResults = 0;
    if (useRAG && agent.knowledgeBases?.length > 0) {
      for (const kbId of agent.knowledgeBases) {
        const results = await ragSystem.query({
          query: message,
          knowledgeBaseId: kbId,
          agentId,
          topK: 3,
        });
        ragResults += results.length;
        ragContext += results.map(r => r.content).join('\n');
      }
    }

    // Get conversation history
    const history = await DynamoDBService.query(
      TABLES.EXECUTIONS,
      'PK = :pk AND begins_with(SK, :sk)',
      {
        ':pk': `AGENT#${agentId}`,
        ':sk': 'MSG#',
      }
    );

    const recentMessages = history
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .reverse();

    // Build system prompt
    const systemPrompt = `${agent.config?.systemPrompt || 'You are a helpful AI assistant.'}

${memoryContext ? `\nRelevant memories:\n${memoryContext}` : ''}
${ragContext ? `\nRelevant knowledge:\n${ragContext}` : ''}

Always be helpful, accurate, and concise.`;

    // Prepare messages for OpenAI
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: agent.config?.model || 'gpt-4-turbo-preview',
      messages,
      temperature: agent.config?.temperature || 0.7,
      max_tokens: 2000,
    });

    const assistantMessage = completion.choices[0].message.content || '';

    // Store messages in DynamoDB
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();

    // Store user message
    await DynamoDBService.put(TABLES.EXECUTIONS, {
      PK: `AGENT#${agentId}`,
      SK: `MSG#${timestamp}#USER`,
      id: messageId,
      agentId,
      userId: session.user.sub,
      role: 'user',
      content: message,
      attachments,
      createdAt: timestamp,
    });

    // Store assistant message
    await DynamoDBService.put(TABLES.EXECUTIONS, {
      PK: `AGENT#${agentId}`,
      SK: `MSG#${timestamp}#ASSISTANT`,
      id: `${messageId}_response`,
      agentId,
      userId: session.user.sub,
      role: 'assistant',
      content: assistantMessage,
      context: {
        memoriesRetrieved,
        ragResults,
        model: agent.config?.model || 'gpt-4-turbo-preview',
        tokensUsed: completion.usage?.total_tokens || 0,
      },
      createdAt: timestamp,
    });

    // Store important information in memory
    if (message.length > 50) {
      await agentMemory.store(
        agentId,
        session.user.sub,
        `User asked: ${message.substring(0, 100)}`,
        'short_term',
        0.6,
        { timestamp }
      );
    }

    return NextResponse.json({
      id: `${messageId}_response`,
      role: 'assistant',
      content: assistantMessage,
      context: {
        memoriesRetrieved,
        ragResults,
        tokensUsed: completion.usage?.total_tokens || 0,
      },
      timestamp,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message', details: error.message },
      { status: 500 }
    );
  }
}

// Get chat history
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

    const messages = await DynamoDBService.query(
      TABLES.EXECUTIONS,
      'PK = :pk AND begins_with(SK, :sk)',
      {
        ':pk': `AGENT#${agentId}`,
        ':sk': 'MSG#',
      }
    );

    const sortedMessages = messages
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .reverse();

    return NextResponse.json({ messages: sortedMessages });
  } catch (error: any) {
    console.error('Get chat history error:', error);
    return NextResponse.json(
      { error: 'Failed to get chat history', details: error.message },
      { status: 500 }
    );
  }
}
