# 🚀 Complete AI Agent Platform - Setup Guide

## Overview

This is a comprehensive AI agent platform with:
- ✅ **DynamoDB** for scalable data storage
- ✅ **RAG (Retrieval Augmented Generation)** for knowledge bases
- ✅ **MCP (Model Context Protocol)** integration
- ✅ **Agent Memory** (short-term, long-term, episodic)
- ✅ **Rules Engine** for custom agent behavior
- ✅ **Planning System** for multi-step task execution
- ✅ **Tool/App Connections** (Gmail, Slack, etc.)
- ✅ **Auth0** for secure authentication
- ✅ **Token Vault** for credential management

---

## 📋 Prerequisites

1. **AWS Account** with DynamoDB access
2. **Auth0 Account**
3. **OpenAI API Key**
4. **Node.js 18+**
5. **Git**

---

## 🛠️ Installation

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- AWS SDK for DynamoDB
- LangChain for RAG
- OpenAI SDK
- Auth0 SDK
- And all other dependencies

### Step 2: Add Type Definitions

```bash
npm install --save-dev @types/uuid @types/node
```

---

## 🔐 Environment Variables

Create `.env.local` file:

```bash
# Auth0
AUTH0_SECRET=your-32-char-secret
AUTH0_BASE_URL=https://your-app.amplifyapp.com
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# AWS DynamoDB
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# DynamoDB Tables
DYNAMODB_AGENTS_TABLE=AgentFlow-Agents
DYNAMODB_EXECUTIONS_TABLE=AgentFlow-Executions
DYNAMODB_MEMORY_TABLE=AgentFlow-Memory
DYNAMODB_KNOWLEDGE_BASES_TABLE=AgentFlow-KnowledgeBases
DYNAMODB_VECTORS_TABLE=AgentFlow-Vectors
DYNAMODB_RULES_TABLE=AgentFlow-Rules
DYNAMODB_TOOLS_TABLE=AgentFlow-Tools
DYNAMODB_CONNECTIONS_TABLE=AgentFlow-Connections
DYNAMODB_ANALYTICS_TABLE=AgentFlow-Analytics

# AI Models
OPENAI_API_KEY=sk-proj-your-key
GROQ_API_KEY=gsk_your-key

# Google OAuth (for Gmail)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
GOOGLE_REDIRECT_URI=https://your-app.amplifyapp.com/api/auth/gmail/callback
```

---

## 🗄️ DynamoDB Setup

### Create Tables

Run this AWS CLI command or use the AWS Console:

```bash
# Agents Table
aws dynamodb create-table \
  --table-name AgentFlow-Agents \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    "IndexName=GSI1,KeySchema=[{AttributeName=GSI1PK,KeyType=HASH},{AttributeName=GSI1SK,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1

# Executions Table
aws dynamodb create-table \
  --table-name AgentFlow-Executions \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    "IndexName=GSI1,KeySchema=[{AttributeName=GSI1PK,KeyType=HASH},{AttributeName=GSI1SK,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1

# Memory Table
aws dynamodb create-table \
  --table-name AgentFlow-Memory \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    "IndexName=GSI1,KeySchema=[{AttributeName=GSI1PK,KeyType=HASH},{AttributeName=GSI1SK,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1

# Knowledge Bases Table
aws dynamodb create-table \
  --table-name AgentFlow-KnowledgeBases \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1

# Vectors Table
aws dynamodb create-table \
  --table-name AgentFlow-Vectors \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1

# Rules Table
aws dynamodb create-table \
  --table-name AgentFlow-Rules \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    "IndexName=GSI1,KeySchema=[{AttributeName=GSI1PK,KeyType=HASH},{AttributeName=GSI1SK,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

### Or use Terraform

See `infrastructure/terraform/dynamodb.tf` for Terraform configuration.

---

## 🚀 Usage Examples

### 1. Create an Agent with RAG

```typescript
import { agentManager } from '@/lib/agent-manager';
import { ragSystem } from '@/lib/rag/rag-system';

// Create agent
const agent = await agentManager.createAgent(
  userId,
  'Research Assistant',
  'data_analyst',
  {
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    systemPrompt: 'You are a research assistant with access to company knowledge.',
  }
);

// Create knowledge base
const kb = await ragSystem.createKnowledgeBase(
  userId,
  'Company Docs',
  'Internal documentation and policies',
  'documents'
);

// Add documents
await ragSystem.addDocuments(kb.id, [
  {
    content: 'Company vacation policy: 20 days per year...',
    metadata: { type: 'policy', department: 'HR' }
  },
  {
    content: 'Engineering guidelines: Use TypeScript for all projects...',
    metadata: { type: 'guideline', department: 'Engineering' }
  }
]);

// Grant agent access to knowledge base
await ragSystem.grantAccess(kb.id, agent.id, ['read', 'search']);
```

### 2. Add Memory to Agent

```typescript
import { agentMemory } from '@/lib/memory/agent-memory';

// Store important information
await agentMemory.store(
  agent.id,
  userId,
  'User prefers emails to be summarized in bullet points',
  'long_term',
  0.9, // High importance
  { category: 'preferences' }
);

// Retrieve memories
const memories = await agentMemory.retrieve({
  agentId: agent.id,
  type: 'long_term',
  limit: 10
});
```

### 3. Create Rules for Agent

```typescript
import { rulesEngine } from '@/lib/rules/rules-engine';

// Don't send emails after 10 PM
await rulesEngine.createRule(
  agent.id,
  userId,
  'No late night emails',
  'Prevent sending emails outside business hours',
  'guardrail',
  [
    { field: 'currentState.time.hour', operator: 'greater_than', value: 22 }
  ],
  [
    { type: 'stop_execution', params: { reason: 'Outside business hours' } }
  ],
  100 // High priority
);

// Auto-respond to urgent emails
await rulesEngine.createRule(
  agent.id,
  userId,
  'Auto-respond urgent',
  'Automatically respond to urgent emails',
  'trigger',
  [
    { field: 'input.subject', operator: 'contains', value: 'URGENT' }
  ],
  [
    { type: 'execute_tool', params: { tool: 'gmail', action: 'send' } },
    { type: 'send_notification', params: { channel: 'slack' } }
  ],
  90
);
```

### 4. Create and Execute a Plan

```typescript
import { agentPlanner } from '@/lib/planning/planner';

// Create plan
const plan = await agentPlanner.createPlan({
  agentId: agent.id,
  userId,
  task: 'Summarize unread emails and draft responses',
  availableTools: ['gmail', 'llm', 'memory'],
  knowledgeBases: [kb.id],
  maxSteps: 10
});

// Execute plan
const result = await agentPlanner.executePlan(plan.id, agent.id);

console.log('Plan completed:', result.status);
console.log('Result:', result.result);
```

---

## 🎨 Agent Builder UI

### Custom Agent Creation Flow

1. **Basic Info**: Name, description, type
2. **Tools**: Select which apps/services to connect
3. **Knowledge Bases**: Add documents, databases, APIs
4. **Memory**: Configure memory types and retention
5. **Rules**: Define triggers, conditions, guardrails
6. **Planning**: Set task complexity and constraints
7. **Deploy**: Activate agent

---

## 📊 Features

### RAG (Retrieval Augmented Generation)
- Vector embeddings with OpenAI
- Semantic search
- Permission-based access
- Multiple knowledge base types

### Memory System
- **Short-term**: Recent interactions
- **Long-term**: Important information
- **Episodic**: Task execution history
- **Semantic**: Conceptual knowledge
- Automatic consolidation

### Rules Engine
- **Triggers**: Event-based activation
- **Conditions**: Complex logic evaluation
- **Actions**: Multi-step responses
- **Guardrails**: Safety constraints
- Priority-based execution

### Planning System
- Multi-step task decomposition
- Dependency management
- Template variables
- Error handling and recovery
- Memory integration

### Tool Connections
- Gmail (read, send, manage)
- Slack (messages, channels)
- Calendar (events, scheduling)
- Notion (pages, databases)
- Custom APIs

---

## 🔒 Security

### Auth0 Integration
- User authentication
- Agent ownership
- Permission management

### Token Vault
- Encrypted credential storage
- Automatic token refresh
- Secure OAuth flows

### Data Isolation
- User-scoped data
- Agent-specific permissions
- Knowledge base access control

---

## 📈 Monitoring

### Agent Analytics
- Execution count
- Success rate
- Average execution time
- Token usage
- Cost tracking

### Memory Stats
- Total memories
- By type breakdown
- Average importance
- Access patterns

### Rule Evaluation
- Trigger frequency
- Action execution
- Guardrail activations

---

## 🚀 Deployment

### AWS Amplify

1. **Connect GitHub repo**
2. **Set environment variables** (all from `.env.local`)
3. **Deploy**

### Environment Variables in Amplify

Add all variables from `.env.local` to Amplify Console:
- App settings → Environment variables → Manage variables

### Build Settings

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

---

## 🧪 Testing

```bash
# Run development server
npm run dev

# Test agent creation
curl -X POST http://localhost:3000/api/agents \
  -H "Cookie: appSession=..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "type": "email_assistant",
    "description": "Test agent",
    "config": {}
  }'

# Test RAG query
curl -X POST http://localhost:3000/api/rag/query \
  -H "Cookie: appSession=..." \
  -H "Content-Type: application/json" \
  -d '{
    "knowledgeBaseId": "kb_123",
    "query": "What is the vacation policy?",
    "topK": 5
  }'
```

---

## 📚 API Documentation

See `API_DOCUMENTATION.md` for complete API reference.

---

## 🎯 Next Steps

1. **Install dependencies**: `npm install`
2. **Set up DynamoDB tables**
3. **Configure environment variables**
4. **Deploy to Amplify**
5. **Create your first agent**
6. **Add knowledge bases**
7. **Define rules**
8. **Execute tasks**

---

## 🆘 Troubleshooting

### DynamoDB Connection Issues
- Check AWS credentials
- Verify region settings
- Ensure tables exist

### RAG Not Working
- Verify OpenAI API key
- Check knowledge base permissions
- Ensure documents are indexed

### Agent Execution Fails
- Check tool permissions
- Verify OAuth tokens
- Review rule conflicts

---

## 📖 Additional Resources

- [Auth0 AI Agents](https://auth0.com/ai/docs)
- [LangChain Documentation](https://js.langchain.com/)
- [AWS DynamoDB Guide](https://docs.aws.amazon.com/dynamodb/)
- [OpenAI API Reference](https://platform.openai.com/docs)

---

**Your complete AI agent platform is ready! Build powerful, autonomous agents with RAG, memory, rules, and planning.** 🚀
