// DynamoDB Configuration and Client
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  BatchWriteCommand,
  BatchGetCommand,
} from '@aws-sdk/lib-dynamodb';
import { FileStorage } from '../file-storage';

// Initialize DynamoDB Client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
});

// Document client for easier operations
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

// Table names
export const TABLES = {
  AGENTS: process.env.DYNAMODB_AGENTS_TABLE || 'AgentFlow-Agents',
  EXECUTIONS: process.env.DYNAMODB_EXECUTIONS_TABLE || 'AgentFlow-Executions',
  MEMORY: process.env.DYNAMODB_MEMORY_TABLE || 'AgentFlow-Memory',
  KNOWLEDGE_BASES: process.env.DYNAMODB_KNOWLEDGE_BASES_TABLE || 'AgentFlow-KnowledgeBases',
  VECTORS: process.env.DYNAMODB_VECTORS_TABLE || 'AgentFlow-Vectors',
  RULES: process.env.DYNAMODB_RULES_TABLE || 'AgentFlow-Rules',
  TOOLS: process.env.DYNAMODB_TOOLS_TABLE || 'AgentFlow-Tools',
  CONNECTIONS: process.env.DYNAMODB_CONNECTIONS_TABLE || 'AgentFlow-Connections',
  TOKENS: process.env.DYNAMODB_TOKENS_TABLE || 'AgentFlow-Tokens',
  ANALYTICS: process.env.DYNAMODB_ANALYTICS_TABLE || 'AgentFlow-Analytics',
};

// Check if DynamoDB is available
let dynamoDBAvailable: boolean | null = null;

async function checkDynamoDBAvailability(): Promise<boolean> {
  if (dynamoDBAvailable !== null) return dynamoDBAvailable;
  
  try {
    // Try a simple operation to check if DynamoDB is available
    await docClient.send(new GetCommand({
      TableName: TABLES.AGENTS,
      Key: { PK: 'TEST', SK: 'TEST' }
    }));
    dynamoDBAvailable = true;
    console.log('[DynamoDB] ✅ DynamoDB is available');
    return true;
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException' || error.name === 'UnrecognizedClientException') {
      console.log('[DynamoDB] ⚠️ DynamoDB not available, using file storage fallback');
      dynamoDBAvailable = false;
      return false;
    }
    // Table exists but query failed for other reason
    dynamoDBAvailable = true;
    return true;
  }
}

// Generic CRUD operations
export class DynamoDBService {
  /**
   * Put item into table
   */
  static async put(tableName: string, item: any): Promise<void> {
    try {
      await docClient.send(
        new PutCommand({
          TableName: tableName,
          Item: item,
        })
      );
      console.log(`[DynamoDB] ✅ PUT ${tableName}`);
    } catch (error: any) {
      console.error(`[DynamoDB] ❌ PUT failed:`, error.message);
      console.log(`[DynamoDB] Using file storage fallback`);
      await FileStorage.put(tableName, item);
    }
  }

  /**
   * Get item from table
   */
  static async get(tableName: string, key: Record<string, any>): Promise<any> {
    try {
      const result = await docClient.send(
        new GetCommand({
          TableName: tableName,
          Key: key,
        })
      );
      console.log(`[DynamoDB] ✅ GET ${tableName}:`, result.Item ? 'found' : 'not found');
      return result.Item;
    } catch (error: any) {
      console.error(`[DynamoDB] ❌ GET failed:`, error.message);
      console.log(`[DynamoDB] Using file storage fallback`);
      return await FileStorage.get(tableName, key as { PK: string; SK: string });
    }
  }

  /**
   * Query items with conditions
   */
  static async query(
    tableName: string,
    keyConditionExpression: string,
    expressionAttributeValues: Record<string, any>,
    indexName?: string
  ): Promise<any[]> {
    try {
      const result = await docClient.send(
        new QueryCommand({
          TableName: tableName,
          KeyConditionExpression: keyConditionExpression,
          ExpressionAttributeValues: expressionAttributeValues,
          IndexName: indexName,
        })
      );
      console.log(`[DynamoDB] ✅ QUERY ${tableName}: found ${result.Items?.length || 0} items`);
      return result.Items || [];
    } catch (error: any) {
      console.error(`[DynamoDB] ❌ QUERY failed:`, error.message);
      console.log(`[DynamoDB] Using file storage fallback`);
      return await FileStorage.query(tableName, keyConditionExpression, expressionAttributeValues);
    }
  }

  /**
   * Update item in table
   */
  static async update(
    tableName: string,
    key: Record<string, any>,
    updateExpression: string,
    expressionAttributeValues: Record<string, any>,
    expressionAttributeNames?: Record<string, string>
  ): Promise<any> {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW',
      })
    );
    return result.Attributes;
  }

  /**
   * Delete item from table
   */
  static async delete(tableName: string, key: Record<string, any>): Promise<void> {
    try {
      await docClient.send(
        new DeleteCommand({
          TableName: tableName,
          Key: key,
        })
      );
      console.log(`[DynamoDB] ✅ DELETE ${tableName}`);
    } catch (error: any) {
      console.error(`[DynamoDB] ❌ DELETE failed:`, error.message);
      console.log(`[DynamoDB] Using file storage fallback`);
      await FileStorage.delete(tableName, key as { PK: string; SK: string });
    }
  }

  /**
   * Scan table (use sparingly)
   */
  static async scan(tableName: string, filterExpression?: string, expressionAttributeValues?: Record<string, any>): Promise<any[]> {
    const result = await docClient.send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );
    return result.Items || [];
  }

  /**
   * Batch write items
   */
  static async batchWrite(tableName: string, items: any[]): Promise<void> {
    const batches = [];
    for (let i = 0; i < items.length; i += 25) {
      batches.push(items.slice(i, i + 25));
    }

    for (const batch of batches) {
      await docClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [tableName]: batch.map(item => ({
              PutRequest: { Item: item },
            })),
          },
        })
      );
    }
  }

  /**
   * Batch get items
   */
  static async batchGet(tableName: string, keys: Record<string, any>[]): Promise<any[]> {
    const batches = [];
    for (let i = 0; i < keys.length; i += 100) {
      batches.push(keys.slice(i, i + 100));
    }

    const results: any[] = [];
    for (const batch of batches) {
      const result = await docClient.send(
        new BatchGetCommand({
          RequestItems: {
            [tableName]: {
              Keys: batch,
            },
          },
        })
      );
      if (result.Responses?.[tableName]) {
        results.push(...result.Responses[tableName]);
      }
    }
    return results;
  }
}

export default DynamoDBService;
