# 🔧 Quick Integration Guide - Add Chat to Agent Page

## Add Agent Chat Panel to Agent Detail Page

### **Step 1: Update Agent Detail Page**

Edit: `app/agent/[id]/page.tsx`

**Add import at top:**
```typescript
import AgentChatPanel from '@/components/AgentChatPanel';
```

**Add chat panel in the layout (after activity feed):**

Find the section with the activity feed and add:

```tsx
{/* Agent Chat Panel */}
<div className="lg:col-span-1">
  <div className="sticky top-4">
    <h2 className="text-lg font-bold text-gray-900 mb-4">💬 Chat with Agent</h2>
    <div className="h-[600px]">
      <AgentChatPanel 
        agentId={agent.id}
        agentName={agent.name}
        recentEmails={activities}
      />
    </div>
  </div>
</div>
```

### **Step 2: Update Layout (Optional)**

Change the grid layout to accommodate chat:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Left: Activity Feed (2 columns) */}
  <div className="lg:col-span-2">
    {/* Activity Feed content */}
  </div>
  
  {/* Right: Sidebar (1 column) */}
  <div className="lg:col-span-1 space-y-6">
    {/* Chat Panel */}
    <AgentChatPanel 
      agentId={agent.id}
      agentName={agent.name}
      recentEmails={activities}
    />
    
    {/* Stats */}
    {/* AI Recommendations */}
    {/* Performance */}
  </div>
</div>
```

---

## Add Action Buttons to Activity Feed

### **Update Activity Item to Include Actions**

In the activity feed rendering, add action buttons:

```tsx
{activity.aiInsights?.suggestedActions && (
  <div className="mt-3 flex flex-wrap gap-2">
    {activity.aiInsights.suggestedActions.map((action: string, idx: number) => (
      <button
        key={idx}
        onClick={async () => {
          // Execute action
          const actionType = action.toLowerCase().includes('reply') ? 'auto_reply' :
                           action.toLowerCase().includes('schedule') ? 'schedule_meeting' :
                           action.toLowerCase().includes('archive') ? 'archive' :
                           action.toLowerCase().includes('flag') ? 'flag' : 'categorize';
          
          const response = await fetch(`/api/agents/${agent.id}/actions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: actionType,
              emailId: activity.id,
              data: {
                email: activity,
                replyType: 'acknowledge'
              }
            })
          });
          
          if (response.ok) {
            alert(`✅ ${action} completed!`);
          }
        }}
        className="px-3 py-1 text-xs font-medium bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-colors"
      >
        {action}
      </button>
    ))}
  </div>
)}
```

---

## Example: Complete Integration

```tsx
'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AgentChatPanel from '@/components/AgentChatPanel';
// ... other imports

export default function AgentDetailPage() {
  // ... existing state and logic

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        {/* ... existing header */}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Activity Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Feed */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Activity Feed</h2>
              {/* ... activity feed content */}
            </div>
          </div>

          {/* Right Column: Chat & Stats */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Agent Chat */}
            <div className="h-[600px]">
              <AgentChatPanel 
                agentId={agent.id}
                agentName={agent.name}
                recentEmails={activities}
              />
            </div>

            {/* Today's Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {/* ... stats content */}
            </div>

            {/* AI Recommendations */}
            <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl border border-primary-200 p-6">
              {/* ... recommendations content */}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Testing Checklist

After integration:

- [ ] Chat panel appears on agent detail page
- [ ] Can send messages to agent
- [ ] Agent responds intelligently
- [ ] Suggested actions appear
- [ ] Action buttons work in activity feed
- [ ] Auto-reply sends emails
- [ ] Meeting scheduling works
- [ ] Email categorization works

---

## Quick Commands to Test

Try these in the chat:

1. "What are my unread emails?"
2. "Summarize my inbox"
3. "Draft a reply to [email subject]"
4. "Schedule a meeting"
5. "What can you help me with?"
6. "Show me important messages"

---

**That's it! Your AI email agent is fully integrated!** 🎉
