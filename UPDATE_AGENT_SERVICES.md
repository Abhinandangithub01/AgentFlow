# Update Existing Agent Services

## Problem
Agents created before the services fix don't have `services: ['gmail']` in their config, so emails aren't being fetched.

## Solution Options

### Option 1: Delete and Recreate Agent (RECOMMENDED)
1. Go to agent detail page
2. Click "Delete" button
3. Go back to /agents
4. Click "Create Agent"
5. Select "Email Assistant" template
6. Enter name (e.g., "Gmail")
7. Click "Create Agent"
8. ✅ New agent will have services: ['gmail', 'slack']
9. ✅ Emails will be fetched automatically

### Option 2: Wait for Auto-Detection
The activity API now has fallback detection that checks:
- `agent.type === 'email_assistant'` OR
- `agent.name.includes('gmail')` OR
- `agent.name.includes('email')`

So if your agent is named "Gmail" or has type "email_assistant", it should work automatically.

### Option 3: Manual Update via API (Advanced)
```bash
# Update agent config to include services
PATCH /api/agents/{agentId}
{
  "metadata": {
    "config": {
      "services": ["gmail", "slack"]
    }
  }
}
```

## Verification

After creating new agent, check console logs:
```
[Activity] Services in config: ['gmail', 'slack'] ✅
[Activity] Should fetch Gmail: true ✅
[Activity] Gmail token found, fetching emails... ✅
[Activity] Found X recent emails from past 24 hours ✅
```

## Expected Behavior

**With services configured:**
- ✅ Emails fetched from past 24 hours
- ✅ AI categorization applied
- ✅ Recommendations shown
- ✅ Action buttons displayed

**Without services:**
- ❌ "No activity yet" message
- ❌ No emails fetched
