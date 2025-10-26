import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { ragSystem } from '@/lib/rag/rag-system';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, knowledgeBaseId, agentId, topK = 5, filters } = body;

    if (!query || !knowledgeBaseId || !agentId) {
      return NextResponse.json(
        { error: 'Query, knowledge base ID, and agent ID are required' },
        { status: 400 }
      );
    }

    // Query the RAG system
    const results = await ragSystem.query({
      query,
      knowledgeBaseId,
      agentId,
      topK,
      filters,
    });

    return NextResponse.json({
      results,
      count: results.length,
      query,
    });
  } catch (error: any) {
    console.error('RAG query error:', error);
    return NextResponse.json(
      { error: 'Failed to query knowledge base', details: error.message },
      { status: 500 }
    );
  }
}
