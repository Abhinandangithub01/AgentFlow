# 📁 Codebase Organization

## Directory Structure

```
agent-platform/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── agents/              # Agent CRUD & operations
│   │   │   ├── route.ts         # List/Create agents
│   │   │   └── [id]/            # Agent-specific operations
│   │   │       ├── chat/        # Chat with agent
│   │   │       ├── execute/     # Execute agent tasks
│   │   │       ├── executions/  # Execution history
│   │   │       └── widgets/     # Widget management
│   │   ├── auth/                # Auth0 authentication
│   │   ├── connections/         # App integrations
│   │   │   ├── gmail/           # Gmail OAuth
│   │   │   ├── slack/           # Slack OAuth
│   │   │   └── route.ts         # Connection management
│   │   └── knowledge/           # Knowledge base operations
│   │       ├── upload/          # Document upload
│   │       └── query/           # RAG queries
│   ├── agent/[id]/              # Agent pages
│   │   ├── page.tsx             # Activity feed
│   │   ├── dashboard/           # Custom dashboard
│   │   └── settings/            # Agent settings
│   ├── builder/                 # Agent builder
│   ├── dashboard/               # Main dashboard
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
│
├── components/                   # React Components
│   ├── builder/                 # Builder components
│   │   ├── KnowledgeBaseManager.tsx
│   │   └── RulesEditor.tsx
│   ├── chat/                    # Chat components
│   │   └── ChatInterface.tsx
│   ├── dashboard/               # Dashboard components
│   │   └── WidgetGrid.tsx
│   ├── notifications/           # Notification system
│   │   ├── Toast.tsx
│   │   └── ToastProvider.tsx
│   ├── widgets/                 # Widget components
│   │   ├── AnalyticsWidget.tsx
│   │   ├── CalendarWidget.tsx
│   │   ├── EmailWidget.tsx
│   │   └── TasksWidget.tsx
│   ├── ErrorBoundary.tsx        # Error handling
│   └── LoadingStates.tsx        # Loading components
│
├── lib/                          # Core Libraries
│   ├── aws/                     # AWS services
│   │   └── s3-service.ts        # S3 operations
│   ├── db/                      # Database
│   │   └── dynamodb.ts          # DynamoDB client
│   ├── memory/                  # Memory system
│   │   └── agent-memory.ts
│   ├── planning/                # Planning system
│   │   └── planner.ts
│   ├── rag/                     # RAG system
│   │   └── rag-system.ts
│   ├── rules/                   # Rules engine
│   │   └── rules-engine.ts
│   ├── agent-manager.ts         # Agent management
│   ├── groq.ts                  # GROQ AI integration
│   └── token-vault.ts           # Token management
│
├── hooks/                        # Custom React Hooks
│   └── useToast.ts              # Toast notifications
│
├── types/                        # TypeScript Types
│   └── agent.ts                 # Agent types
│
├── lambda/                       # AWS Lambda Functions
│   └── document-processor/      # Document processing
│       ├── index.js
│       └── package.json
│
├── scripts/                      # Deployment Scripts
│   └── deploy-lambda.sh         # Lambda deployment
│
├── public/                       # Static Assets
│
└── Documentation/                # Documentation Files
    ├── README.md                # Main readme
    ├── USER_FLOWS.md            # User flows
    ├── DEVELOPER_GUIDE.md       # Developer reference
    ├── DEPLOYMENT_GUIDE.md      # Deployment instructions
    ├── COMPLETE_SETUP_GUIDE.md  # Setup guide
    ├── IMPLEMENTATION_COMPLETE.md
    └── CODEBASE_ORGANIZATION.md # This file
```

---

## 🎯 Core Features & Files

### 1. Authentication (Auth0)
**Purpose**: User authentication and session management

**Files**:
- `app/api/auth/[auth0]/route.ts` - Auth0 routes
- `app/layout.tsx` - UserProvider wrapper

**Dependencies**: `@auth0/nextjs-auth0`

---

### 2. Agent Management
**Purpose**: Create, read, update, delete agents

**Files**:
- `app/api/agents/route.ts` - List/Create
- `app/api/agents/[id]/route.ts` - Get/Update/Delete
- `lib/agent-manager.ts` - Agent logic
- `types/agent.ts` - Type definitions

**Database**: DynamoDB `AgentFlow-Agents` table

---

### 3. Chat System
**Purpose**: Real-time chat with agents

**Files**:
- `app/api/agents/[id]/chat/route.ts` - Chat API
- `components/chat/ChatInterface.tsx` - Chat UI
- `lib/memory/agent-memory.ts` - Context retrieval
- `lib/rag/rag-system.ts` - Knowledge retrieval

**Database**: DynamoDB `AgentFlow-Executions` table

---

### 4. RAG System
**Purpose**: Document upload and semantic search

**Files**:
- `app/api/knowledge/upload/route.ts` - Upload API
- `app/api/knowledge/query/route.ts` - Query API
- `lib/rag/rag-system.ts` - RAG logic
- `lib/aws/s3-service.ts` - S3 operations
- `lambda/document-processor/` - Text extraction

**Database**: 
- DynamoDB `AgentFlow-KnowledgeBases` table
- DynamoDB `AgentFlow-Vectors` table
- S3 `agentflow-documents` bucket

---

### 5. Memory System
**Purpose**: Agent memory (short-term, long-term, episodic, semantic)

**Files**:
- `lib/memory/agent-memory.ts` - Memory logic

**Database**: DynamoDB `AgentFlow-Memory` table

---

### 6. Rules Engine
**Purpose**: Custom agent behavior rules

**Files**:
- `lib/rules/rules-engine.ts` - Rules logic
- `components/builder/RulesEditor.tsx` - Rules UI

**Database**: DynamoDB `AgentFlow-Rules` table

---

### 7. Planning System
**Purpose**: Multi-step task execution

**Files**:
- `lib/planning/planner.ts` - Planning logic
- `app/api/agents/[id]/execute/route.ts` - Execution API

**Database**: DynamoDB `AgentFlow-Executions` table

---

### 8. Widget System
**Purpose**: Customizable dashboard widgets

**Files**:
- `app/api/agents/[id]/widgets/route.ts` - Widget API
- `components/dashboard/WidgetGrid.tsx` - Grid layout
- `components/widgets/*.tsx` - Widget components

**Database**: DynamoDB `AgentFlow-Agents` table (widget config)

---

### 9. App Integrations
**Purpose**: Connect Gmail, Slack, Calendar

**Files**:
- `app/api/connections/gmail/` - Gmail OAuth
- `app/api/connections/slack/` - Slack OAuth
- `lib/token-vault.ts` - Token storage

**Database**: DynamoDB `AgentFlow-Connections` table

---

### 10. UI Components
**Purpose**: Reusable UI components

**Files**:
- `components/ErrorBoundary.tsx` - Error handling
- `components/LoadingStates.tsx` - Loading states
- `components/notifications/` - Toast notifications

---

## 🗑️ Files to Remove (Cleanup)

### Temporary/Build Files
```bash
# Already removed
- push-ui-builder.ps1
- push-final-polish.ps1
- push-complete-features.ps1
```

### Duplicate Documentation (Keep Latest)
```bash
# Keep these:
- README.md
- USER_FLOWS.md
- DEVELOPER_GUIDE.md
- DEPLOYMENT_GUIDE.md
- CODEBASE_ORGANIZATION.md

# Can archive these (move to /docs/archive/):
- COMPLETE_SETUP_GUIDE.md (merged into DEPLOYMENT_GUIDE.md)
- COMPLETE_PLATFORM_IMPLEMENTATION.md (merged into README.md)
- FINAL_IMPLEMENTATION_SUMMARY.md (merged into IMPLEMENTATION_COMPLETE.md)
- AUTH0_AI_AGENTS_IMPLEMENTATION.md (specific to Auth0, keep for reference)
```

---

## 📊 Database Schema

### DynamoDB Tables (9 total)

1. **AgentFlow-Agents**
   - PK: `USER#userId`
   - SK: `AGENT#agentId`
   - Stores: Agent config, widgets, status

2. **AgentFlow-Executions**
   - PK: `AGENT#agentId`
   - SK: `PLAN#planId` or `MSG#timestamp`
   - Stores: Plans, chat messages, execution history

3. **AgentFlow-Memory**
   - PK: `AGENT#agentId`
   - SK: `MEMORY#memoryId`
   - Stores: Agent memories (all types)

4. **AgentFlow-KnowledgeBases**
   - PK: `KB#knowledgeBaseId`
   - SK: `DOC#documentId`
   - Stores: Knowledge bases, documents

5. **AgentFlow-Vectors**
   - PK: `KB#knowledgeBaseId`
   - SK: `CHUNK#chunkId`
   - Stores: Text chunks, embeddings

6. **AgentFlow-Rules**
   - PK: `AGENT#agentId`
   - SK: `RULE#ruleId`
   - Stores: Agent rules

7. **AgentFlow-Tools**
   - PK: `AGENT#agentId`
   - SK: `TOOL#toolId`
   - Stores: Tool configurations

8. **AgentFlow-Connections**
   - PK: `USER#userId`
   - SK: `SERVICE#serviceName`
   - Stores: OAuth connections

9. **AgentFlow-Analytics**
   - PK: `AGENT#agentId`
   - SK: `METRIC#timestamp`
   - Stores: Usage analytics

---

## 🔄 Data Flow

### Chat Message Flow
```
User → ChatInterface → POST /api/agents/[id]/chat
  ↓
Rules Engine (check guardrails)
  ↓
Memory System (retrieve context)
  ↓
RAG System (query knowledge)
  ↓
OpenAI (generate response)
  ↓
DynamoDB (store messages)
  ↓
Response → ChatInterface → User
```

### Document Upload Flow
```
User → KnowledgeBaseManager → POST /api/knowledge/upload
  ↓
S3 (store file)
  ↓
Lambda (process document)
  ↓
Extract text → Chunk → Generate embeddings
  ↓
DynamoDB (store vectors)
  ↓
Status update → User
```

---

## 🎨 Component Hierarchy

```
App (layout.tsx)
├── ErrorBoundary
├── UserProvider (Auth0)
├── ToastProvider (Notifications)
└── Page Content
    ├── Dashboard
    │   ├── AgentCard[]
    │   └── CreateAgentButton
    ├── Agent Detail
    │   ├── ActivityFeed
    │   ├── Stats
    │   └── ConnectedServices
    ├── Agent Dashboard
    │   ├── WidgetGrid
    │   │   ├── EmailWidget
    │   │   ├── CalendarWidget
    │   │   ├── TasksWidget
    │   │   ├── ChatWidget
    │   │   └── AnalyticsWidget
    │   └── ChatSidebar
    └── Builder
        ├── OverviewTab
        ├── KnowledgeBaseManager
        ├── MemoryDashboard
        ├── RulesEditor
        ├── ToolsManager
        └── SettingsPanel
```

---

## 🔐 Security Layers

1. **Authentication**: Auth0 (all routes)
2. **Authorization**: User ownership checks
3. **Token Storage**: Token Vault (encrypted)
4. **API Security**: Session validation
5. **Data Isolation**: User-scoped queries
6. **File Upload**: Type/size validation
7. **OAuth**: Secure token exchange

---

## 📈 Performance Optimizations

1. **Code Splitting**: Dynamic imports for heavy components
2. **Image Optimization**: Next.js Image component
3. **API Caching**: React Query (ready to add)
4. **Database**: DynamoDB on-demand scaling
5. **CDN**: Amplify CDN for static assets
6. **Lazy Loading**: Widgets load on demand

---

## 🧪 Testing Strategy (Future)

```
Unit Tests
├── lib/ (Business logic)
├── components/ (UI components)
└── hooks/ (Custom hooks)

Integration Tests
├── API routes
├── Database operations
└── OAuth flows

E2E Tests
├── User flows
├── Agent creation
└── Chat interactions
```

---

## 🚀 Deployment Pipeline

```
Local Development
  ↓
Git Commit
  ↓
GitHub Push
  ↓
AWS Amplify (Auto-detect)
  ↓
Build (npm run build)
  ↓
Deploy to CDN
  ↓
Live Production
```

---

## 📝 Code Style Guide

### TypeScript
- Use interfaces for objects
- Use types for unions/primitives
- Always define return types
- Avoid `any` type

### React
- Functional components only
- Use hooks for state
- Extract custom hooks
- Keep components focused

### Naming
- Components: PascalCase
- Files: kebab-case or PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE

### File Organization
- One component per file
- Co-locate related files
- Index files for exports
- Types in separate files

---

**This organization ensures a clean, maintainable, and scalable codebase!**
