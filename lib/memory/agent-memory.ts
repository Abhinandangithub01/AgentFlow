// Agent Memory System
// Provides short-term and long-term memory for agents

import DynamoDBService, { TABLES } from '../db/dynamodb';
import { v4 as uuidv4 } from 'uuid';

export interface Memory {
  id: string;
  agentId: string;
  userId: string;
  type: 'short_term' | 'long_term' | 'episodic' | 'semantic';
  content: string;
  context?: Record<string, any>;
  importance: number; // 0-1 scale
  accessCount: number;
  lastAccessedAt: string;
  createdAt: string;
  expiresAt?: string;
}

export interface MemoryQuery {
  agentId: string;
  query?: string;
  type?: Memory['type'];
  limit?: number;
  minImportance?: number;
}

export class AgentMemorySystem {
  /**
   * Store a new memory
   */
  async store(
    agentId: string,
    userId: string,
    content: string,
    type: Memory['type'] = 'short_term',
    importance: number = 0.5,
    context?: Record<string, any>,
    ttlDays?: number
  ): Promise<Memory> {
    const memory: Memory = {
      id: `mem_${uuidv4()}`,
      agentId,
      userId,
      type,
      content,
      context,
      importance,
      accessCount: 0,
      lastAccessedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      expiresAt: ttlDays
        ? new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    };

    await DynamoDBService.put(TABLES.MEMORY, {
      ...memory,
      PK: `AGENT#${agentId}`,
      SK: `MEM#${memory.id}`,
      GSI1PK: `USER#${userId}`,
      GSI1SK: `AGENT#${agentId}#MEM#${memory.id}`,
    });

    return memory;
  }

  /**
   * Retrieve memories for an agent
   */
  async retrieve(query: MemoryQuery): Promise<Memory[]> {
    let memories = await DynamoDBService.query(
      TABLES.MEMORY,
      'PK = :pk',
      { ':pk': `AGENT#${query.agentId}` }
    );

    // Filter by type if specified
    if (query.type) {
      memories = memories.filter(m => m.type === query.type);
    }

    // Filter by importance
    if (query.minImportance !== undefined) {
      memories = memories.filter(m => m.importance >= query.minImportance);
    }

    // Sort by importance and recency
    memories.sort((a, b) => {
      const importanceScore = b.importance - a.importance;
      if (Math.abs(importanceScore) > 0.1) return importanceScore;
      return new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime();
    });

    // Limit results
    if (query.limit) {
      memories = memories.slice(0, query.limit);
    }

    // Update access count and timestamp
    for (const memory of memories) {
      await this.updateAccess(memory.id, memory.agentId);
    }

    return memories.map(m => ({
      id: m.id,
      agentId: m.agentId,
      userId: m.userId,
      type: m.type,
      content: m.content,
      context: m.context,
      importance: m.importance,
      accessCount: m.accessCount + 1,
      lastAccessedAt: new Date().toISOString(),
      createdAt: m.createdAt,
      expiresAt: m.expiresAt,
    }));
  }

  /**
   * Update memory importance based on usage
   */
  async updateImportance(memoryId: string, agentId: string, newImportance: number): Promise<void> {
    await DynamoDBService.update(
      TABLES.MEMORY,
      { PK: `AGENT#${agentId}`, SK: `MEM#${memoryId}` },
      'SET importance = :importance',
      { ':importance': Math.max(0, Math.min(1, newImportance)) }
    );
  }

  /**
   * Delete a memory
   */
  async delete(memoryId: string, agentId: string): Promise<void> {
    await DynamoDBService.delete(TABLES.MEMORY, {
      PK: `AGENT#${agentId}`,
      SK: `MEM#${memoryId}`,
    });
  }

  /**
   * Clear all memories for an agent
   */
  async clearAll(agentId: string, type?: Memory['type']): Promise<void> {
    let memories = await DynamoDBService.query(
      TABLES.MEMORY,
      'PK = :pk',
      { ':pk': `AGENT#${agentId}` }
    );

    if (type) {
      memories = memories.filter(m => m.type === type);
    }

    for (const memory of memories) {
      await DynamoDBService.delete(TABLES.MEMORY, {
        PK: memory.PK,
        SK: memory.SK,
      });
    }
  }

  /**
   * Consolidate short-term memories into long-term
   */
  async consolidate(agentId: string, userId: string): Promise<void> {
    // Get all short-term memories
    const shortTermMemories = await this.retrieve({
      agentId,
      type: 'short_term',
      minImportance: 0.7, // Only consolidate important memories
    });

    // Group related memories
    const consolidated = this.groupRelatedMemories(shortTermMemories);

    // Create long-term memories from consolidated groups
    for (const group of consolidated) {
      const content = group.map(m => m.content).join('. ');
      const avgImportance = group.reduce((sum, m) => sum + m.importance, 0) / group.length;

      await this.store(
        agentId,
        userId,
        content,
        'long_term',
        avgImportance,
        { consolidatedFrom: group.map(m => m.id) }
      );

      // Delete original short-term memories
      for (const memory of group) {
        await this.delete(memory.id, agentId);
      }
    }
  }

  /**
   * Get memory statistics
   */
  async getStats(agentId: string): Promise<{
    total: number;
    byType: Record<string, number>;
    avgImportance: number;
  }> {
    const memories = await DynamoDBService.query(
      TABLES.MEMORY,
      'PK = :pk',
      { ':pk': `AGENT#${agentId}` }
    );

    const byType: Record<string, number> = {};
    let totalImportance = 0;

    for (const memory of memories) {
      byType[memory.type] = (byType[memory.type] || 0) + 1;
      totalImportance += memory.importance;
    }

    return {
      total: memories.length,
      byType,
      avgImportance: memories.length > 0 ? totalImportance / memories.length : 0,
    };
  }

  // Private helper methods

  private async updateAccess(memoryId: string, agentId: string): Promise<void> {
    await DynamoDBService.update(
      TABLES.MEMORY,
      { PK: `AGENT#${agentId}`, SK: `MEM#${memoryId}` },
      'SET accessCount = accessCount + :inc, lastAccessedAt = :timestamp',
      {
        ':inc': 1,
        ':timestamp': new Date().toISOString(),
      }
    );
  }

  private groupRelatedMemories(memories: Memory[]): Memory[][] {
    // Simple grouping by time proximity (within 1 hour)
    const groups: Memory[][] = [];
    let currentGroup: Memory[] = [];

    const sorted = [...memories].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    for (const memory of sorted) {
      if (currentGroup.length === 0) {
        currentGroup.push(memory);
      } else {
        const lastMemory = currentGroup[currentGroup.length - 1];
        const timeDiff =
          new Date(memory.createdAt).getTime() - new Date(lastMemory.createdAt).getTime();

        if (timeDiff < 60 * 60 * 1000) {
          // Within 1 hour
          currentGroup.push(memory);
        } else {
          groups.push(currentGroup);
          currentGroup = [memory];
        }
      }
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }
}

// Export singleton
export const agentMemory = new AgentMemorySystem();
