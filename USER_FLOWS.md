# 👥 User Flows - AgentFlow Platform

## Overview
This document defines the complete user journey through the AgentFlow platform, from signup to advanced agent management.

---

## 🎯 Core User Flows

### 1. New User Onboarding Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Landing Page (/)                                         │
│    - View features                                          │
│    - Click "Get Started" or "Sign In"                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Auth0 Login                                              │
│    - Sign up with email/social                             │
│    - Or login if existing user                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Dashboard (/dashboard)                                   │
│    - Empty state: "Create your first agent"               │
│    - Quick start guide                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Create First Agent                                       │
│    - Choose agent type                                      │
│    - Configure basic settings                              │
│    - Deploy agent                                          │
└─────────────────────────────────────────────────────────────┘
```

**Key Pages:**
- `/` - Landing page
- `/api/auth/login` - Auth0 login
- `/dashboard` - Main dashboard
- `/builder` - Agent creation

---

### 2. Agent Creation Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Agent Builder (/builder)                           │
│    - Enter agent name                                       │
│    - Select agent type:                                     │
│      • Email Assistant                                      │
│      • Task Automator                                       │
│      • Data Analyst                                         │
│      • Custom                                               │
│    - Add description                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Configure Knowledge (Optional)                     │
│    - Create knowledge base                                  │
│    - Upload documents (PDF, DOCX, TXT)                     │
│    - Documents processed by Lambda                          │
│    - Vector embeddings created                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Connect Apps (Optional)                            │
│    - Connect Gmail (OAuth flow)                            │
│    - Connect Slack (OAuth flow)                            │
│    - Connect Calendar                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Configure Rules (Optional)                         │
│    - Create triggers                                        │
│    - Set conditions                                         │
│    - Define actions                                         │
│    - Add guardrails                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Deploy Agent                                        │
│    - Review configuration                                   │
│    - Click "Deploy Agent"                                   │
│    - Agent becomes active                                   │
└─────────────────────────────────────────────────────────────┘
```

**Key Pages:**
- `/builder` - Agent builder
- `/builder?tab=knowledge` - Knowledge base setup
- `/builder?tab=tools` - App connections
- `/builder?tab=rules` - Rules configuration

---

### 3. Daily Agent Usage Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Dashboard (/dashboard)                                   │
│    - View all agents                                        │
│    - See agent status (Active/Paused)                      │
│    - Quick stats overview                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Select Agent                                             │
│    - Click on agent card                                    │
│    - Navigate to agent page                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Agent Activity Page (/agent/[id])                       │
│    - View real-time activity feed                          │
│    - See completed actions                                  │
│    - Review items needing attention                         │
│    - Approve/reject agent actions                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Agent Dashboard (/agent/[id]/dashboard)                 │
│    - Customize widget layout                                │
│    - View email widget                                      │
│    - Check calendar widget                                  │
│    - Manage tasks widget                                    │
│    - View analytics widget                                  │
│    - Chat with agent                                        │
└─────────────────────────────────────────────────────────────┘
```

**Key Pages:**
- `/dashboard` - All agents
- `/agent/[id]` - Agent activity feed
- `/agent/[id]/dashboard` - Customizable dashboard
- `/agent/[id]/settings` - Agent settings

---

### 4. Chat with Agent Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Open Chat                                                │
│    - From dashboard: Click chat widget                     │
│    - From agent page: Click "Chat" button                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Send Message                                             │
│    - Type message                                           │
│    - Optionally attach files                               │
│    - Press Enter or click Send                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Agent Processing                                         │
│    - Agent retrieves context from memory                   │
│    - Agent queries knowledge bases (RAG)                   │
│    - Agent evaluates rules                                  │
│    - Agent generates response with OpenAI                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Receive Response                                         │
│    - View agent response with markdown                     │
│    - See context used (KB results, memory, tools)         │
│    - Copy, rate, or regenerate response                   │
└─────────────────────────────────────────────────────────────┘
```

**API Flow:**
```
POST /api/agents/[id]/chat
  ↓
Check rules → Retrieve memory → Query RAG → Call OpenAI
  ↓
Store conversation → Return response
```

---

### 5. Document Upload Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Knowledge Base Manager                                   │
│    - Navigate to /builder?tab=knowledge                    │
│    - Click "Create Knowledge Base"                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Upload Document                                          │
│    - Select knowledge base                                  │
│    - Choose file (PDF, DOCX, TXT, MD)                     │
│    - Click "Upload"                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend Processing                                       │
│    - File uploaded to S3                                    │
│    - Lambda function triggered                             │
│    - Text extracted from document                          │
│    - Text chunked (1000 chars, 200 overlap)               │
│    - Embeddings generated with OpenAI                      │
│    - Vectors stored in DynamoDB                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Document Ready                                           │
│    - Status changes to "Completed"                         │
│    - Document searchable via RAG                           │
│    - Agent can query document                              │
└─────────────────────────────────────────────────────────────┘
```

**API Flow:**
```
POST /api/knowledge/upload (FormData)
  ↓
Upload to S3 → Trigger Lambda → Extract text
  ↓
Chunk text → Generate embeddings → Store vectors
  ↓
Update status → Return success
```

---

### 6. App Connection Flow (Gmail Example)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Initiate Connection                                      │
│    - Navigate to /builder?tab=tools                        │
│    - Click "Connect Gmail"                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. OAuth Flow                                               │
│    - Redirect to Google OAuth                              │
│    - User grants permissions                               │
│    - Google redirects back with code                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Token Exchange                                           │
│    - Exchange code for tokens                              │
│    - Store tokens in Token Vault                           │
│    - Create connection record in DynamoDB                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Connection Active                                        │
│    - Gmail connected                                        │
│    - Agent can read/send emails                            │
│    - Email widget shows inbox                              │
└─────────────────────────────────────────────────────────────┘
```

**API Flow:**
```
GET /api/connections/gmail/connect
  ↓
Redirect to Google OAuth
  ↓
GET /api/connections/gmail/callback?code=...
  ↓
Exchange code → Store tokens → Create connection
  ↓
Redirect to dashboard with success message
```

---

### 7. Widget Customization Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Open Dashboard                                           │
│    - Navigate to /agent/[id]/dashboard                     │
│    - View current widget layout                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Enter Edit Mode                                          │
│    - Click "Edit Layout" button                            │
│    - Widgets become draggable/resizable                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Customize Layout                                         │
│    - Drag widgets to reposition                            │
│    - Resize widgets by dragging corners                    │
│    - Add new widgets from library                          │
│    - Remove unwanted widgets                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Save Layout                                              │
│    - Click "Done Editing"                                   │
│    - Layout automatically saved to DynamoDB                │
│    - Widgets lock in place                                 │
└─────────────────────────────────────────────────────────────┘
```

**API Flow:**
```
POST /api/agents/[id]/widgets (Create widget)
  ↓
PATCH /api/agents/[id]/widgets (Update position)
  ↓
DELETE /api/agents/[id]/widgets (Remove widget)
```

---

## 🎯 Key User Journeys

### Journey 1: Email Management Agent
```
User Goal: Automate email management

1. Create "Email Assistant" agent
2. Connect Gmail (OAuth)
3. Upload company email templates (RAG)
4. Create rules:
   - Flag urgent emails from VIPs
   - Auto-categorize newsletters
   - Draft responses for common queries
5. Add email widget to dashboard
6. Monitor agent activity
7. Approve/edit drafted responses
8. Chat with agent: "Summarize unread emails"
```

### Journey 2: Task Automation Agent
```
User Goal: Automate task management

1. Create "Task Automator" agent
2. Connect Slack + Calendar
3. Upload project documentation (RAG)
4. Create rules:
   - Create tasks from Slack mentions
   - Schedule meetings automatically
   - Send daily summaries
5. Add tasks + calendar widgets
6. Monitor task completion
7. Chat with agent: "What's on my schedule today?"
```

### Journey 3: Research Agent
```
User Goal: Monitor industry trends

1. Create "Research Agent" agent
2. Upload research papers (RAG)
3. Create rules:
   - Monitor specific topics
   - Summarize findings
   - Alert on important updates
4. Add analytics widget
5. Chat with agent: "What are the latest trends in AI?"
6. Review summaries and insights
```

---

## 📊 User Flow Metrics

### Success Metrics
- **Time to First Agent**: < 5 minutes
- **Time to First Action**: < 10 minutes
- **Widget Customization**: < 2 minutes
- **Document Upload**: < 1 minute
- **App Connection**: < 2 minutes

### User Engagement
- **Daily Active Users**: Check dashboard daily
- **Agent Interactions**: Chat 3-5 times per day
- **Widget Usage**: View widgets 10+ times per day
- **Document Uploads**: 2-3 per week
- **Rule Creation**: 1-2 per agent

---

## 🔄 Navigation Structure

```
Landing (/)
  ↓
Dashboard (/dashboard)
  ├── Agent Builder (/builder)
  │   ├── Overview
  │   ├── Knowledge
  │   ├── Memory
  │   ├── Rules
  │   ├── Tools
  │   └── Settings
  │
  ├── Agent Detail (/agent/[id])
  │   ├── Activity Feed (default)
  │   ├── Dashboard (/agent/[id]/dashboard)
  │   └── Settings (/agent/[id]/settings)
  │
  └── User Profile (/profile)
```

---

## 🎨 UI States

### Loading States
- Page load: Full page loader
- Data fetch: Skeleton loaders
- Action processing: Spinner + progress
- File upload: Progress bar

### Empty States
- No agents: "Create your first agent"
- No widgets: "Add your first widget"
- No documents: "Upload your first document"
- No connections: "Connect your first app"

### Error States
- Network error: Retry button
- Auth error: Re-login prompt
- Validation error: Inline error messages
- System error: Error boundary with home button

### Success States
- Agent created: Toast notification + redirect
- Document uploaded: Toast + status update
- Connection made: Toast + widget update
- Message sent: Instant UI update

---

## 🔐 Permission Flow

```
User Authentication (Auth0)
  ↓
User Session Created
  ↓
Access Agent (Check ownership)
  ↓
Perform Action (Check permissions)
  ↓
Execute with Token Vault
  ↓
Log Activity
```

---

## 📱 Responsive Behavior

### Desktop (> 1024px)
- Full dashboard with sidebar
- Multi-column widget grid
- Chat sidebar visible

### Tablet (768px - 1024px)
- Collapsible sidebar
- 2-column widget grid
- Chat as modal

### Mobile (< 768px)
- Bottom navigation
- Single-column widgets
- Full-screen chat

---

## 🎯 Conversion Funnel

```
Landing Page (100%)
  ↓ 60%
Sign Up (60%)
  ↓ 80%
Create First Agent (48%)
  ↓ 70%
Connect First App (34%)
  ↓ 90%
Daily Active User (31%)
```

---

## 🚀 Onboarding Checklist

- [ ] Sign up with Auth0
- [ ] Create first agent
- [ ] Upload first document
- [ ] Connect first app (Gmail/Slack)
- [ ] Customize dashboard
- [ ] Chat with agent
- [ ] Create first rule
- [ ] Review agent activity

---

**This user flow document ensures a clear, intuitive experience for all users!**
