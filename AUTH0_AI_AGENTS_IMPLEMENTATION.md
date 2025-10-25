# 🤖 Auth0 AI Agents - Complete Implementation Guide

## Overview

This implementation follows Auth0's AI Agent framework for building secure, autonomous AI agents with proper authentication, authorization, and credential management.

## 🏗️ Architecture

### Core Components

1. **Agent Manager** (`lib/agent-manager.ts`)
   - Create and configure AI agents
   - Manage agent lifecycle (start, pause, stop)
   - Execute agent tasks
   - Handle agent permissions

2. **Token Vault** (`lib/token-vault.ts`)
   - Secure OAuth token storage
   - API key management
   - Token refresh and rotation
   - Integration with Auth0 Token Vault

3. **Agent Types** (`types/agent.ts`)
   - TypeScript definitions for all agent-related types
   - Agent configurations
   - Execution tracking
   - RAG (Retrieval Augmented Generation) types

4. **API Routes** (`app/api/agents/`)
   - RESTful API for agent management
   - Secure endpoints with Auth0 authentication
   - Agent CRUD operations

---

## 🔐 Security Features

### 1. User Authentication
- **Auth0 Integration**: All agent operations require authenticated users
- **Session Management**: Secure session handling via `@auth0/nextjs-auth0`
- **User Isolation**: Agents are scoped to individual users

### 2. Token Vault
```typescript
// Store OAuth tokens securely
await tokenVault.storeOAuthToken(
  userId,
  'gmail',
  {
    accessToken: 'token_here',
    refreshToken: 'refresh_token_here',
    tokenType: 'Bearer'
  },
  agentId
);

// Retrieve tokens for agent use
const tokens = await tokenVault.getOAuthToken(userId, 'gmail', agentId);
```

### 3. Permission System
```typescript
// Agents have fine-grained permissions
agent.permissions = [
  { resource: 'gmail', actions: ['read', 'send'] },
  { resource: 'calendar', actions: ['read', 'write'] }
];
```

---

## 🚀 Quick Start

### 1. Create an AI Agent

```typescript
import { agentManager } from '@/lib/agent-manager';

const agent = await agentManager.createAgent(
  userId,
  'Email Assistant',
  'email_assistant',
  {
    model: 'gpt-4',
    temperature: 0.7,
    systemPrompt: 'You are a helpful email assistant...',
    tools: ['gmail'],
  }
);
```

### 2. Add Tools to Agent

```typescript
// Add Gmail integration
await agentManager.addToolToAgent(
  agent.id,
  userId,
  'gmail',
  true // requires authentication
);
```

### 3. Authorize Agent Tool

```typescript
// After OAuth flow, store credentials
await agentManager.authorizeAgentTool(
  agent.id,
  userId,
  'gmail',
  accessToken,
  refreshToken
);
```

### 4. Start Agent

```typescript
// Activate the agent
await agentManager.startAgent(agent.id, userId);
```

### 5. Execute Task

```typescript
// Run a task
const execution = await agentManager.executeTask(
  agent.id,
  userId,
  'Summarize unread emails from today'
);
```

---

## 📊 Agent Types

### Email Assistant
- **Capabilities**: Read emails, send emails, categorize, draft replies
- **Tools**: Gmail, Slack
- **Use Cases**: Inbox management, automated responses, email triage

### Calendar Manager
- **Capabilities**: Read calendar, create events, update events
- **Tools**: Google Calendar, Outlook
- **Use Cases**: Meeting scheduling, availability management

### Task Automator
- **Capabilities**: Workflow automation, task scheduling
- **Tools**: Multiple integrations
- **Use Cases**: Multi-step automations, recurring tasks

### Data Analyst
- **Capabilities**: Data analysis, visualization, insights
- **Tools**: Database connections, APIs
- **Use Cases**: Report generation, trend analysis

### Content Creator
- **Capabilities**: Content generation, editing
- **Tools**: LLM models, content APIs
- **Use Cases**: Blog posts, social media, documentation

---

## 🔧 API Endpoints

### Agent Management

#### GET /api/agents
List all agents for authenticated user
```bash
curl -X GET https://your-app.com/api/agents \
  -H "Cookie: appSession=..."
```

#### POST /api/agents
Create a new agent
```bash
curl -X POST https://your-app.com/api/agents \
  -H "Cookie: appSession=..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Email Agent",
    "type": "email_assistant",
    "description": "Manages my inbox",
    "config": {
      "model": "gpt-4",
      "temperature": 0.7
    }
  }'
```

#### GET /api/agents/[id]
Get agent details
```bash
curl -X GET https://your-app.com/api/agents/agent_123 \
  -H "Cookie: appSession=..."
```

#### PATCH /api/agents/[id]
Update agent configuration
```bash
curl -X PATCH https://your-app.com/api/agents/agent_123 \
  -H "Cookie: appSession=..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "config": { "temperature": 0.8 }
  }'
```

#### DELETE /api/agents/[id]
Delete an agent
```bash
curl -X DELETE https://your-app.com/api/agents/agent_123 \
  -H "Cookie: appSession=..."
```

### Agent Execution

#### POST /api/agents/[id]/execute
Execute a task
```bash
curl -X POST https://your-app.com/api/agents/agent_123/execute \
  -H "Cookie: appSession=..." \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Summarize unread emails"
  }'
```

#### GET /api/agents/[id]/executions
Get execution history
```bash
curl -X GET https://your-app.com/api/agents/agent_123/executions \
  -H "Cookie: appSession=..."
```

---

## 🔐 Token Vault Integration

### Storing Credentials

```typescript
import { tokenVault } from '@/lib/token-vault';

// OAuth tokens
await tokenVault.storeOAuthToken(
  userId,
  'gmail',
  {
    accessToken: 'ya29.a0...',
    refreshToken: '1//0g...',
    expiresIn: 3600,
    tokenType: 'Bearer',
    scope: 'gmail.readonly gmail.send'
  },
  agentId,
  ['gmail.readonly', 'gmail.send']
);

// API keys
await tokenVault.storeAPIKey(
  userId,
  'openai',
  'sk-proj-...',
  agentId
);
```

### Retrieving Credentials

```typescript
// Get OAuth token (automatically refreshes if expired)
const tokens = await tokenVault.getOAuthToken(userId, 'gmail', agentId);

// Get API key
const apiKey = await tokenVault.getAPIKey(userId, 'openai', agentId);
```

### Revoking Access

```typescript
// Revoke and delete tokens
await tokenVault.revokeToken(userId, 'gmail', agentId);
```

---

## 🎯 RAG (Retrieval Augmented Generation)

### Knowledge Base Setup

```typescript
// Create knowledge base
const kb: RAGKnowledgeBase = {
  id: 'kb_123',
  userId: userId,
  name: 'Company Documentation',
  description: 'Internal docs and policies',
  type: 'documents',
  status: 'active',
  permissions: [
    {
      agentId: agent.id,
      actions: ['read', 'search'],
      filters: { department: 'engineering' }
    }
  ],
  config: {
    embeddingModel: 'text-embedding-ada-002',
    chunkSize: 1000,
    chunkOverlap: 200
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
```

### Query Knowledge Base

```typescript
const query: RAGQuery = {
  query: 'What is our vacation policy?',
  knowledgeBaseId: 'kb_123',
  agentId: agent.id,
  topK: 5,
  includeMetadata: true
};

// Results include relevant documents with scores
const results: RAGResult[] = await searchKnowledgeBase(query);
```

---

## 🛡️ Security Best Practices

### 1. Principle of Least Privilege
```typescript
// Only grant necessary permissions
agent.permissions = [
  { resource: 'gmail', actions: ['read'] }, // Read-only
  // Don't grant 'delete' unless absolutely necessary
];
```

### 2. Token Rotation
```typescript
// Tokens are automatically refreshed
// Manual rotation for API keys
await tokenVault.revokeToken(userId, 'service', agentId);
await tokenVault.storeAPIKey(userId, 'service', newApiKey, agentId);
```

### 3. Audit Logging
```typescript
// All agent actions are logged
execution.steps.forEach(step => {
  console.log(`[${step.startedAt}] ${agent.name}: ${step.name}`);
});
```

### 4. Rate Limiting
```typescript
agent.metadata.config.rateLimits = {
  requestsPerMinute: 10,
  requestsPerHour: 100,
  requestsPerDay: 1000,
  tokensPerDay: 100000
};
```

---

## 📈 Monitoring & Analytics

### Agent Metrics

```typescript
interface AgentMetrics {
  executionsToday: number;
  successRate: number;
  averageExecutionTime: number;
  tokensUsed: number;
  cost: number;
  lastError?: string;
}
```

### Execution Tracking

```typescript
// Each execution is tracked
const execution: AgentExecution = {
  id: 'exec_123',
  agentId: agent.id,
  userId: userId,
  task: 'Process emails',
  status: 'completed',
  startedAt: '2025-01-01T00:00:00Z',
  completedAt: '2025-01-01T00:01:30Z',
  steps: [
    {
      id: 'step_1',
      name: 'Fetch unread emails',
      tool: 'gmail',
      status: 'completed',
      startedAt: '2025-01-01T00:00:00Z',
      completedAt: '2025-01-01T00:00:15Z'
    },
    {
      id: 'step_2',
      name: 'Analyze content',
      status: 'completed',
      startedAt: '2025-01-01T00:00:15Z',
      completedAt: '2025-01-01T00:01:30Z'
    }
  ],
  tokensUsed: 1500,
  cost: 0.03
};
```

---

## 🔄 Integration Flow

### Complete OAuth Flow for Agent Tools

```typescript
// 1. User initiates OAuth
const authUrl = getGmailAuthUrl();
// Redirect user to authUrl

// 2. OAuth callback receives code
const { code } = callbackParams;
const tokens = await getGmailTokens(code);

// 3. Store in Token Vault
await agentManager.authorizeAgentTool(
  agentId,
  userId,
  'gmail',
  tokens.access_token,
  tokens.refresh_token
);

// 4. Agent can now use Gmail
const execution = await agentManager.executeTask(
  agentId,
  userId,
  'Read my latest emails'
);
```

---

## 🚀 Production Deployment

### Environment Variables

```bash
# Auth0 Configuration
AUTH0_SECRET=your-secret-here
AUTH0_BASE_URL=https://your-app.com
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# OAuth Integrations
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-app.com/api/auth/gmail/callback

# AI Models
OPENAI_API_KEY=sk-proj-...
GROQ_API_KEY=gsk_...

# Database (for production)
DATABASE_URL=postgresql://...
```

### Database Schema

```sql
-- Agents table
CREATE TABLE agents (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Token Vault (encrypted)
CREATE TABLE token_vault (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  agent_id VARCHAR(255),
  service VARCHAR(100) NOT NULL,
  encrypted_data TEXT NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Executions
CREATE TABLE executions (
  id VARCHAR(255) PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  task TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  result JSONB,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

---

## 📚 Additional Resources

- [Auth0 AI Agents Documentation](https://auth0.com/ai/docs)
- [Auth0 Token Vault](https://auth0.com/ai/docs/intro/token-vault)
- [RAG Authorization](https://auth0.com/ai/docs/get-started/authorization-for-rag)
- [Auth0 Assistant Sample](https://github.com/auth0-samples/auth0-assistant0)

---

## 🎉 Next Steps

1. **Test Agent Creation**: Create your first agent via the API
2. **Add Integrations**: Connect Gmail, Calendar, or other services
3. **Execute Tasks**: Run agent tasks and monitor executions
4. **Build UI**: Create dashboard for agent management
5. **Deploy to Production**: Set up database and Auth0 Token Vault

---

**Your AI agents are now ready to work autonomously with secure authentication and authorization!** 🚀
