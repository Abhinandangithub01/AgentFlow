// RAG (Retrieval Augmented Generation) System
// Enables agents to access and query knowledge bases

import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from '@langchain/core/documents';
import DynamoDBService, { TABLES } from '../db/dynamodb';
import { RAGKnowledgeBase, RAGQuery, RAGResult } from '@/types/agent';
import { v4 as uuidv4 } from 'uuid';

export class RAGSystem {
  private embeddings: OpenAIEmbeddings;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small',
    });

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
  }

  /**
   * Create a new knowledge base
   */
  async createKnowledgeBase(
    userId: string,
    name: string,
    description: string,
    type: 'documents' | 'database' | 'api' | 'custom'
  ): Promise<RAGKnowledgeBase> {
    const kb: RAGKnowledgeBase = {
      id: `kb_${uuidv4()}`,
      userId,
      name,
      description,
      type,
      status: 'active',
      permissions: [],
      config: {
        embeddingModel: 'text-embedding-3-small',
        chunkSize: 1000,
        chunkOverlap: 200,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await DynamoDBService.put(TABLES.KNOWLEDGE_BASES, {
      ...kb,
      PK: `USER#${userId}`,
      SK: `KB#${kb.id}`,
    });

    return kb;
  }

  /**
   * Add documents to knowledge base
   */
  async addDocuments(
    knowledgeBaseId: string,
    documents: { content: string; metadata?: Record<string, any> }[]
  ): Promise<void> {
    const kb = await this.getKnowledgeBase(knowledgeBaseId);
    if (!kb) {
      throw new Error('Knowledge base not found');
    }

    // Update status to indexing
    await DynamoDBService.update(
      TABLES.KNOWLEDGE_BASES,
      { PK: `USER#${kb.userId}`, SK: `KB#${kb.id}` },
      'SET #status = :status',
      { ':status': 'indexing' },
      { '#status': 'status' }
    );

    try {
      // Process each document
      for (const doc of documents) {
        // Split into chunks
        const chunks = await this.textSplitter.createDocuments(
          [doc.content],
          [doc.metadata || {}]
        );

        // Generate embeddings and store
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const embedding = await this.embeddings.embedQuery(chunk.pageContent);

          const vectorId = `vec_${uuidv4()}`;
          await DynamoDBService.put(TABLES.VECTORS, {
            PK: `KB#${knowledgeBaseId}`,
            SK: `VEC#${vectorId}`,
            id: vectorId,
            knowledgeBaseId,
            content: chunk.pageContent,
            embedding,
            metadata: chunk.metadata,
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Update status back to active
      await DynamoDBService.update(
        TABLES.KNOWLEDGE_BASES,
        { PK: `USER#${kb.userId}`, SK: `KB#${kb.id}` },
        'SET #status = :status, updatedAt = :updatedAt',
        { ':status': 'active', ':updatedAt': new Date().toISOString() },
        { '#status': 'status' }
      );
    } catch (error) {
      // Update status to error
      await DynamoDBService.update(
        TABLES.KNOWLEDGE_BASES,
        { PK: `USER#${kb.userId}`, SK: `KB#${kb.id}` },
        'SET #status = :status',
        { ':status': 'error' },
        { '#status': 'status' }
      );
      throw error;
    }
  }

  /**
   * Query knowledge base with semantic search
   */
  async query(query: RAGQuery): Promise<RAGResult[]> {
    // Check permissions
    const kb = await this.getKnowledgeBase(query.knowledgeBaseId);
    if (!kb) {
      throw new Error('Knowledge base not found');
    }

    const hasPermission = kb.permissions.some(
      p => p.agentId === query.agentId && p.actions.includes('search')
    );

    if (!hasPermission) {
      throw new Error('Agent does not have permission to query this knowledge base');
    }

    // Generate query embedding
    const queryEmbedding = await this.embeddings.embedQuery(query.query);

    // Get all vectors for this knowledge base
    const vectors = await DynamoDBService.query(
      TABLES.VECTORS,
      'PK = :pk',
      { ':pk': `KB#${query.knowledgeBaseId}` }
    );

    // Calculate cosine similarity and rank
    const results = vectors
      .map(vec => ({
        id: vec.id,
        content: vec.content,
        score: this.cosineSimilarity(queryEmbedding, vec.embedding),
        metadata: vec.metadata,
        source: vec.metadata?.source,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, query.topK || 5);

    // Apply filters if provided
    if (query.filters) {
      return results.filter(result => {
        return Object.entries(query.filters!).every(
          ([key, value]) => result.metadata?.[key] === value
        );
      });
    }

    return results;
  }

  /**
   * Grant agent access to knowledge base
   */
  async grantAccess(
    knowledgeBaseId: string,
    agentId: string,
    actions: ('read' | 'search' | 'update')[],
    filters?: Record<string, any>
  ): Promise<void> {
    const kb = await this.getKnowledgeBase(knowledgeBaseId);
    if (!kb) {
      throw new Error('Knowledge base not found');
    }

    // Add or update permission
    const existingPermIndex = kb.permissions.findIndex(p => p.agentId === agentId);
    if (existingPermIndex >= 0) {
      kb.permissions[existingPermIndex] = { agentId, actions, filters };
    } else {
      kb.permissions.push({ agentId, actions, filters });
    }

    await DynamoDBService.update(
      TABLES.KNOWLEDGE_BASES,
      { PK: `USER#${kb.userId}`, SK: `KB#${kb.id}` },
      'SET permissions = :permissions, updatedAt = :updatedAt',
      {
        ':permissions': kb.permissions,
        ':updatedAt': new Date().toISOString(),
      }
    );
  }

  /**
   * Revoke agent access to knowledge base
   */
  async revokeAccess(knowledgeBaseId: string, agentId: string): Promise<void> {
    const kb = await this.getKnowledgeBase(knowledgeBaseId);
    if (!kb) {
      throw new Error('Knowledge base not found');
    }

    kb.permissions = kb.permissions.filter(p => p.agentId !== agentId);

    await DynamoDBService.update(
      TABLES.KNOWLEDGE_BASES,
      { PK: `USER#${kb.userId}`, SK: `KB#${kb.id}` },
      'SET permissions = :permissions, updatedAt = :updatedAt',
      {
        ':permissions': kb.permissions,
        ':updatedAt': new Date().toISOString(),
      }
    );
  }

  /**
   * Delete knowledge base and all its vectors
   */
  async deleteKnowledgeBase(knowledgeBaseId: string, userId: string): Promise<void> {
    // Delete all vectors
    const vectors = await DynamoDBService.query(
      TABLES.VECTORS,
      'PK = :pk',
      { ':pk': `KB#${knowledgeBaseId}` }
    );

    for (const vec of vectors) {
      await DynamoDBService.delete(TABLES.VECTORS, {
        PK: vec.PK,
        SK: vec.SK,
      });
    }

    // Delete knowledge base
    await DynamoDBService.delete(TABLES.KNOWLEDGE_BASES, {
      PK: `USER#${userId}`,
      SK: `KB#${knowledgeBaseId}`,
    });
  }

  /**
   * List knowledge bases for user
   */
  async listKnowledgeBases(userId: string): Promise<RAGKnowledgeBase[]> {
    const items = await DynamoDBService.query(
      TABLES.KNOWLEDGE_BASES,
      'PK = :pk AND begins_with(SK, :sk)',
      { ':pk': `USER#${userId}`, ':sk': 'KB#' }
    );

    return items.map(item => ({
      id: item.id,
      userId: item.userId,
      name: item.name,
      description: item.description,
      type: item.type,
      status: item.status,
      permissions: item.permissions || [],
      config: item.config,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  // Private helper methods

  private async getKnowledgeBase(id: string): Promise<RAGKnowledgeBase | null> {
    // In production, we'd need to know the userId or use a GSI
    // For now, scan (not recommended for production)
    const items = await DynamoDBService.scan(
      TABLES.KNOWLEDGE_BASES,
      'SK = :sk',
      { ':sk': `KB#${id}` }
    );

    if (items.length === 0) return null;

    const item = items[0];
    return {
      id: item.id,
      userId: item.userId,
      name: item.name,
      description: item.description,
      type: item.type,
      status: item.status,
      permissions: item.permissions || [],
      config: item.config,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// Export singleton
export const ragSystem = new RAGSystem();
