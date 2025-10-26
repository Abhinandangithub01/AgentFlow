# 👨‍💻 Developer Guide - AgentFlow

## Quick Reference for Common Tasks

### 🎨 Using Components

#### Toast Notifications
```typescript
import { useToast } from '@/hooks/useToast';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Success!', 'Operation completed');
  };

  const handleError = () => {
    toast.error('Error!', 'Something went wrong');
  };

  const handleWarning = () => {
    toast.warning('Warning!', 'Please check this');
  };

  const handleInfo = () => {
    toast.info('Info', 'Just letting you know');
  };

  return <button onClick={handleSuccess}>Show Toast</button>;
}
```

#### Error Boundaries
```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

// Wrap any component that might throw errors
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Or use the HOC
import { withErrorBoundary } from '@/components/ErrorBoundary';

export default withErrorBoundary(YourComponent);
```

#### Loading States
```typescript
import {
  PageLoader,
  CardSkeleton,
  ListSkeleton,
  Spinner,
  ProgressBar,
  EmptyState,
} from '@/components/LoadingStates';

// Full page loading
if (isLoading) return <PageLoader message="Loading..." />;

// Card skeletons
{isLoading ? <CardSkeleton count={3} /> : <CardList />}

// List skeletons
{isLoading ? <ListSkeleton count={5} /> : <List />}

// Inline spinner
<Spinner size="md" />

// Progress bar
<ProgressBar progress={75} label="Processing..." />

// Empty state
<EmptyState
  icon={Database}
  title="No data"
  description="Add your first item"
  action={<button>Add Item</button>}
/>
```

---

### 🔌 API Endpoints

#### Agents
```typescript
// Create agent
POST /api/agents
{
  name: "My Agent",
  type: "email_assistant",
  description: "Handles emails",
  config: { model: "gpt-4-turbo-preview" }
}

// Get agent
GET /api/agents/[id]

// Update agent
PATCH /api/agents/[id]
{
  name: "Updated Name",
  config: { temperature: 0.8 }
}

// Delete agent
DELETE /api/agents/[id]

// List agents
GET /api/agents
```

#### Chat
```typescript
// Send message
POST /api/agents/[id]/chat
{
  message: "Summarize my emails",
  useRAG: true,
  useMemory: true
}

// Get chat history
GET /api/agents/[id]/chat?limit=50
```

#### Widgets
```typescript
// Get widgets
GET /api/agents/[id]/widgets

// Create widget
POST /api/agents/[id]/widgets
{
  type: "email",
  title: "Inbox",
  position: { x: 0, y: 0, w: 6, h: 4 }
}

// Update widget
PATCH /api/agents/[id]/widgets
{
  widgetId: "widget_123",
  position: { x: 2, y: 0, w: 6, h: 4 }
}

// Delete widget
DELETE /api/agents/[id]/widgets?widgetId=widget_123
```

#### Knowledge Base
```typescript
// Upload document
POST /api/knowledge/upload
FormData: {
  file: File,
  knowledgeBaseId: "kb_123",
  agentId: "agent_123"
}

// Query knowledge base
POST /api/knowledge/query
{
  query: "What is the policy?",
  knowledgeBaseId: "kb_123",
  agentId: "agent_123",
  topK: 5
}

// List documents
GET /api/knowledge/upload?knowledgeBaseId=kb_123
```

#### Connections
```typescript
// Connect Gmail
GET /api/connections/gmail/connect?returnUrl=/dashboard

// Connect Slack
GET /api/connections/slack/connect?returnUrl=/dashboard

// List connections
GET /api/connections

// Delete connection
DELETE /api/connections?service=gmail
```

#### Executions
```typescript
// Execute agent
POST /api/agents/[id]/execute
{
  action: "scan-emails"
}

// Get execution history
GET /api/agents/[id]/executions?limit=50&status=completed
```

---

### 🧠 Using Core Systems

#### RAG System
```typescript
import { ragSystem } from '@/lib/rag/rag-system';

// Create knowledge base
const kb = await ragSystem.createKnowledgeBase(
  userId,
  'Company Docs',
  'Internal documentation',
  'documents'
);

// Add documents
await ragSystem.addDocuments(kb.id, [
  {
    content: 'Document text...',
    metadata: { source: 'upload', type: 'policy' }
  }
]);

// Query
const results = await ragSystem.query({
  query: 'What is the vacation policy?',
  knowledgeBaseId: kb.id,
  agentId: agent.id,
  topK: 5
});
```

#### Memory System
```typescript
import { agentMemory } from '@/lib/memory/agent-memory';

// Store memory
await agentMemory.store(
  agentId,
  userId,
  'User prefers bullet points',
  'long_term',
  0.9, // importance
  { category: 'preferences' }
);

// Retrieve memories
const memories = await agentMemory.retrieve({
  agentId,
  type: 'long_term',
  minImportance: 0.7,
  limit: 10
});

// Consolidate memories
await agentMemory.consolidateMemories(agentId);
```

#### Rules Engine
```typescript
import { rulesEngine } from '@/lib/rules/rules-engine';

// Create rule
await rulesEngine.createRule(
  agentId,
  userId,
  'No Late Night Emails',
  'Prevent emails after 10 PM',
  'guardrail',
  [
    { field: 'currentState.time.hour', operator: 'greater_than', value: 22 }
  ],
  [
    { type: 'stop_execution', params: { reason: 'Outside business hours' } }
  ],
  100 // priority
);

// Evaluate rules
const result = await rulesEngine.evaluateRules({
  agentId,
  input: { message: 'Send email' },
  currentState: { time: { hour: 23 } }
});

if (result.shouldStop) {
  console.log('Execution blocked by rules');
}
```

#### Planning System
```typescript
import { agentPlanner } from '@/lib/planning/planner';

// Create plan
const plan = await agentPlanner.createPlan({
  agentId,
  userId,
  task: 'Summarize unread emails and draft responses',
  availableTools: ['gmail', 'llm', 'memory'],
  knowledgeBases: [kb.id],
  maxSteps: 10
});

// Execute plan
const result = await agentPlanner.executePlan(plan.id, agentId);

// Get plan status
const status = await agentPlanner.getPlanStatus(plan.id);
```

---

### 🎨 Creating Custom Widgets

```typescript
// 1. Create widget component
// components/widgets/MyCustomWidget.tsx
'use client';

import { useState, useEffect } from 'motion';
import { Loader2 } from 'lucide-react';

export default function MyCustomWidget({ agentId }: { agentId: string }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [agentId]);

  const loadData = async () => {
    // Fetch your data
    setIsLoading(false);
  };

  if (isLoading) {
    return <Loader2 className="w-6 h-6 animate-spin" />;
  }

  return (
    <div className="h-full">
      {/* Your widget content */}
    </div>
  );
}

// 2. Register in WidgetGrid.tsx
import MyCustomWidget from '@/components/widgets/MyCustomWidget';

function WidgetContent({ widget }: { widget: Widget }) {
  switch (widget.type) {
    case 'my-custom':
      return <MyCustomWidget />;
    // ... other cases
  }
}
```

---

### 🔐 Working with Auth

```typescript
import { getSession } from '@auth0/nextjs-auth0';
import { useUser } from '@auth0/nextjs-auth0/client';

// Server-side (API routes)
export async function GET(request: NextRequest) {
  const session = await getSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.sub;
  // ... your logic
}

// Client-side (components)
function MyComponent() {
  const { user, isLoading } = useUser();

  if (isLoading) return <PageLoader />;
  if (!user) return <div>Please log in</div>;

  return <div>Hello, {user.name}!</div>;
}
```

---

### 📦 Working with DynamoDB

```typescript
import DynamoDBService, { TABLES } from '@/lib/db/dynamodb';

// Put item
await DynamoDBService.put(TABLES.AGENTS, {
  PK: `USER#${userId}`,
  SK: `AGENT#${agentId}`,
  id: agentId,
  name: 'My Agent',
  createdAt: new Date().toISOString()
});

// Get item
const agent = await DynamoDBService.get(TABLES.AGENTS, {
  PK: `USER#${userId}`,
  SK: `AGENT#${agentId}`
});

// Query items
const agents = await DynamoDBService.query(
  TABLES.AGENTS,
  'PK = :pk',
  { ':pk': `USER#${userId}` }
);

// Update item
await DynamoDBService.update(
  TABLES.AGENTS,
  { PK: `USER#${userId}`, SK: `AGENT#${agentId}` },
  'SET #name = :name',
  { ':name': 'Updated Name' },
  { '#name': 'name' }
);

// Delete item
await DynamoDBService.delete(TABLES.AGENTS, {
  PK: `USER#${userId}`,
  SK: `AGENT#${agentId}`
});
```

---

### 📤 Working with S3

```typescript
import S3Service from '@/lib/aws/s3-service';

// Upload file
const result = await S3Service.uploadFile(
  buffer,
  'document.pdf',
  userId,
  agentId,
  { type: 'document' }
);

// Get presigned URL
const url = await S3Service.getPresignedUrl(result.key);

// List files
const files = await S3Service.listFiles(userId, agentId);

// Delete file
await S3Service.deleteFile(result.key);

// Get file content
const content = await S3Service.getFileContent(result.key);
```

---

### 🎯 Best Practices

#### Error Handling
```typescript
// Always wrap async operations in try-catch
try {
  const result = await someAsyncOperation();
  toast.success('Success!', 'Operation completed');
} catch (error) {
  console.error('Operation failed:', error);
  toast.error('Error', error.message);
}
```

#### Loading States
```typescript
// Always show loading states
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  loadData();
}, []);

if (isLoading) return <PageLoader />;
```

#### Type Safety
```typescript
// Always define types
interface MyData {
  id: string;
  name: string;
  createdAt: string;
}

const [data, setData] = useState<MyData | null>(null);
```

#### Component Structure
```typescript
// Keep components focused and reusable
// Bad: One giant component
// Good: Multiple small, focused components

// MyFeature.tsx
export default function MyFeature() {
  return (
    <div>
      <MyHeader />
      <MyContent />
      <MyFooter />
    </div>
  );
}
```

---

### 🧪 Testing

```typescript
// Unit test example (when tests are added)
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

---

### 📝 Code Style

```typescript
// Use TypeScript
// Use functional components
// Use hooks for state management
// Use async/await instead of promises
// Use const for variables that don't change
// Use descriptive variable names
// Add comments for complex logic
// Keep functions small and focused
// Extract reusable logic into hooks
// Use Tailwind for styling
// Use Framer Motion for animations
```

---

### 🚀 Deployment

```bash
# Build locally
npm run build

# Test production build
npm start

# Deploy to Amplify
git push origin main
# Amplify auto-deploys
```

---

### 📚 Useful Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion)
- [Auth0 Docs](https://auth0.com/docs)
- [AWS SDK Docs](https://docs.aws.amazon.com/sdk-for-javascript)

---

**Happy coding! 🎉**
