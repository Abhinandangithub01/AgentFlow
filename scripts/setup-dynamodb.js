/**
 * DynamoDB Table Setup Script
 * Run this to create all required DynamoDB tables
 * 
 * Usage: node scripts/setup-dynamodb.js
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
  DynamoDBDocumentClient, 
  CreateTableCommand,
  DescribeTableCommand 
} = require('@aws-sdk/lib-dynamodb');

const region = process.env.AWS_REGION || 'us-east-1';
const tablePrefix = process.env.DYNAMODB_TABLE_PREFIX || 'AgentFlow';

const client = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(client);

const tables = [
  {
    name: `${tablePrefix}-Agents`,
    description: 'Stores AI agents',
  },
  {
    name: `${tablePrefix}-Tokens`,
    description: 'Stores OAuth tokens',
  },
  {
    name: `${tablePrefix}-Connections`,
    description: 'Stores service connections',
  },
];

async function tableExists(tableName) {
  try {
    await docClient.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

async function createTable(tableName) {
  const params = {
    TableName: tableName,
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST', // On-demand pricing
  };

  try {
    await docClient.send(new CreateTableCommand(params));
    console.log(`✅ Created table: ${tableName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create table ${tableName}:`, error.message);
    return false;
  }
}

async function setupDynamoDB() {
  console.log('🚀 Setting up DynamoDB tables...\n');
  console.log(`Region: ${region}`);
  console.log(`Table Prefix: ${tablePrefix}\n`);

  for (const table of tables) {
    console.log(`Checking ${table.name}...`);
    const exists = await tableExists(table.name);
    
    if (exists) {
      console.log(`✓ Table already exists: ${table.name}\n`);
    } else {
      console.log(`Creating ${table.name}...`);
      await createTable(table.name);
      console.log();
    }
  }

  console.log('✅ DynamoDB setup completed!\n');
  console.log('Tables created:');
  tables.forEach(t => console.log(`  - ${t.name}`));
}

setupDynamoDB().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
