# 🔍 GMAIL CONNECTION - COMPLETE DEBUG GUIDE

## ✅ FIXES DEPLOYED

**Commit:** `45596f3`  
**Message:** "FIX GMAIL CONNECTION: Enhanced logging, check both DynamoDB and Token Vault, fix connection persistence"

**Changes:**
- Enhanced logging throughout the connection flow
- Check both DynamoDB AND Token Vault for connections
- Fixed DynamoDB query to use proper SK prefix
- Added detailed token retrieval logging

---

## 🔧 WHAT WAS FIXED

### **1. Connections API - Dual Source Check** ✅

**BEFORE:**
```typescript
// Only checked DynamoDB, if empty then checked Token Vault
try {
  connections = await DynamoDBService.query(TABLES.CONNECTIONS, ...);
} catch {
  // Check Token Vault
}
```

**AFTER:**
```typescript
// Check DynamoDB first
connections = await DynamoDBService.query(
  TABLES.CONNECTIONS,
  'PK = :pk AND begins_with(SK, :sk)',  // ✅ Fixed query
  { ':pk': `USER#${userId}`, ':sk': 'SERVICE#' }
);

// ALWAYS check Token Vault as well (for redundancy)
for (const service of ['gmail', 'slack', ...]) {
  const token = await tokenVault.getOAuthToken(userId, service);
  if (token && token.accessToken) {
    // Add to connections if not already there
    if (!existsInDB) {
      vaultConnections.push({ service, status: 'connected', ... });
    }
  }
}

// Merge both sources
connections = [...connections, ...vaultConnections];
```

### **2. Enhanced Logging** ✅

**Added logs at every step:**

**Connections API:**
```typescript
console.log('[Connections API] Fetching connections for user:', userId);
console.log('[Connections API] DynamoDB returned:', X, 'connections');
console.log('[Connections API] Checking Token Vault for all services...');
console.log('[Connections API] gmail: token exists =', true/false);
console.log('[Connections API] Added gmail from Token Vault');
console.log('[Connections API] Total connections:', X);
```

**Token Vault:**
```typescript
console.log('[TokenVault] Getting token for key:', key);
console.log('[TokenVault] Token found for gmail, has accessToken:', true/false);
console.log('[TokenVault] Retrieved token from DynamoDB for key:', key);
console.log('[TokenVault] Retrieved token from memory for key:', key);
```

**Gmail Callback:**
```typescript
console.log('Gmail OAuth Callback - Starting');
console.log('Gmail tokens received successfully');
console.log('Tokens stored in Token Vault');
console.log('Connection record stored in DynamoDB');
```

---

## 🧪 DEBUGGING STEPS

### **After Deployment (10-15 min):**

### **Step 1: Clear Everything**
```
1. Clear browser cache (Ctrl+Shift+Delete)
2. Clear cookies for your domain
3. Close all browser tabs
4. Reopen browser
```

### **Step 2: Check Console Before Connecting**
```
1. Open DevTools (F12) → Console
2. Go to /integrations page
3. Look for:
   [Connections API] Fetching connections for user: auth0|...
   [Connections API] DynamoDB returned: 0 connections
   [Connections API] Checking Token Vault for all services...
   [Connections API] gmail: token exists = false
   [Connections API] Total connections: 0
```

### **Step 3: Connect Gmail**
```
1. Click "Connect" button for Gmail
2. Authorize with Google
3. After redirect, check console for:
   Gmail OAuth Callback - Starting
   Gmail tokens received successfully
   Tokens stored in Token Vault
   Connection record stored in DynamoDB
```

### **Step 4: Check Integrations Page**
```
1. Go back to /integrations
2. Check console for:
   [Connections API] Fetching connections for user: auth0|...
   [Connections API] DynamoDB returned: 1 connections
   OR
   [TokenVault] Getting token for key: auth0|...:gmail
   [TokenVault] Token found for gmail, has accessToken: true
   [Connections API] Added gmail from Token Vault
   [Connections API] Total connections: 1
3. ✅ Gmail should show "✓ Connected"
```

### **Step 5: Test Persistence**
```
1. Press F5 (reload page)
2. Check console again
3. ✅ Should still see connection
4. Close browser completely
5. Reopen and login
6. ✅ Should STILL see connection
```

---

## 🔍 TROUBLESHOOTING

### **Issue: Gmail shows "Connect" after connecting**

**Check Console Logs:**

**Scenario A: Token stored but not retrieved**
```
Console shows:
  Tokens stored in Token Vault ✅
  Connection record stored in DynamoDB ✅
  
But on reload:
  [TokenVault] Getting token for key: auth0|123:gmail
  [TokenVault] No token found for gmail ❌
  
FIX: DynamoDB might not be configured properly
```

**Scenario B: Token not stored at all**
```
Console shows:
  Gmail tokens received successfully ✅
  [TokenVault] DynamoDB storage failed, using memory ⚠️
  [TokenVault] Stored token in memory for key: ... ⚠️
  
FIX: AWS credentials not configured
```

**Scenario C: Connection API not checking properly**
```
Console shows:
  [Connections API] DynamoDB returned: 0 connections
  [Connections API] gmail: token exists = false ❌
  
But token WAS stored earlier
  
FIX: User ID mismatch or key format issue
```

### **Issue: "DynamoDB not configured" errors**

**Expected for local development:**
```
[TokenVault] DynamoDB storage failed, using memory
[Connections API] DynamoDB error: ...
```

**This is NORMAL for local dev!** Tokens will be in memory.

**For production (Amplify):**
- DynamoDB should work automatically
- Check AWS environment variables are set
- Check IAM permissions

### **Issue: Token exists but shows as disconnected**

**Check service name matching:**
```typescript
// Token stored as: 'gmail'
// But checking for: 'google-mail' ❌

// Should be consistent:
const services = ['gmail', 'slack', 'google-calendar', ...];
```

---

## 📊 EXPECTED CONSOLE OUTPUT

### **Successful Gmail Connection Flow:**

**1. Click Connect:**
```
[No logs - redirects to Google]
```

**2. After Google Authorization:**
```
Gmail OAuth Callback - Starting
Gmail OAuth Config: {
  clientId: '123456789...',
  redirectUri: 'https://your-domain.com/api/auth/gmail/callback',
  hasClientSecret: true
}
Gmail tokens received successfully
[TokenVault] Stored token in DynamoDB for key: auth0|123:gmail
Tokens stored in Token Vault
Connection record stored in DynamoDB
```

**3. Back on Integrations Page:**
```
[Connections API] Fetching connections for user: auth0|123
[Connections API] DynamoDB returned: 1 connections
[Connections API] Checking Token Vault for all services...
[TokenVault] Getting token for key: auth0|123:gmail
[TokenVault] Token found for gmail, has accessToken: true
[Connections API] gmail: token exists = true, has accessToken = true
[Connections API] Total connections: 1
```

**4. After Page Reload:**
```
[Connections API] Fetching connections for user: auth0|123
[Connections API] DynamoDB returned: 1 connections
[Connections API] Checking Token Vault for all services...
[TokenVault] Getting token for key: auth0|123:gmail
[TokenVault] Retrieved token from DynamoDB for key: auth0|123:gmail
[TokenVault] Token found for gmail, has accessToken: true
[Connections API] gmail: token exists = true, has accessToken = true
[Connections API] Total connections: 1
```

---

## 🗃️ DATA STORAGE

### **DynamoDB TOKENS Table:**
```
PK: TOKEN#auth0|123:gmail
SK: METADATA
---
key: auth0|123:gmail
accessToken: ya29.a0...
refreshToken: 1//0g...
expiresIn: 3600
tokenType: Bearer
scope: gmail.readonly gmail.send
createdAt: 2025-10-27T...
updatedAt: 2025-10-27T...
```

### **DynamoDB CONNECTIONS Table:**
```
PK: USER#auth0|123
SK: SERVICE#gmail
---
id: conn_gmail_1234567890
userId: auth0|123
service: gmail
status: connected
scopes: ["gmail.readonly", "gmail.send"]
connectedAt: 2025-10-27T...
lastUsed: 2025-10-27T...
```

### **Memory Fallback (Local Dev):**
```javascript
global.tokenVault = Map {
  'auth0|123:gmail' => {
    accessToken: 'ya29...',
    refreshToken: '1//0g...',
    expiresIn: 3600,
    tokenType: 'Bearer',
    scope: 'gmail.readonly gmail.send'
  }
}
```

---

## 🎯 KEY POINTS

### **Connection Check Logic:**
1. ✅ Check DynamoDB CONNECTIONS table
2. ✅ Check Token Vault (DynamoDB TOKENS table)
3. ✅ Merge results from both sources
4. ✅ Return all connections found

### **Why Check Both?**
- **DynamoDB CONNECTIONS** = Metadata about connections
- **Token Vault (TOKENS)** = Actual OAuth tokens
- **Redundancy** = If one fails, other works
- **Migration** = Old tokens might only be in vault

### **Token Key Format:**
```
Format: userId:service:agentId (optional)
Example: auth0|123:gmail
Example: auth0|123:gmail:agent_456
```

### **Service Names:**
```
gmail (not google-mail)
slack
google-calendar (not calendar)
notion
twitter
linkedin
```

---

## 🚀 NEXT STEPS

### **After Deployment:**

**1. Test Fresh Connection (10-15 min):**
```
1. Wait for Amplify deployment
2. Clear cache completely
3. Go to /integrations
4. Click "Connect" for Gmail
5. Authorize with Google
6. ✅ Should show "✓ Connected"
7. Check console for all logs
```

**2. Test Persistence:**
```
1. Reload page (F5)
2. ✅ Gmail still connected
3. Close browser
4. Reopen and login
5. ✅ Gmail STILL connected
```

**3. Test Agent Integration:**
```
1. Create agent with Gmail
2. Go to agent detail page
3. ✅ Should fetch real emails
4. ✅ Stats should calculate
5. ✅ Activity feed should populate
```

**4. Share Console Logs:**
```
If still not working:
1. Open DevTools → Console
2. Clear console
3. Go to /integrations
4. Click "Connect" for Gmail
5. Complete OAuth flow
6. Copy ALL console logs
7. Share with me for debugging
```

---

## 📝 SUMMARY

### **What's Fixed:**
- ✅ Enhanced logging everywhere
- ✅ Check both DynamoDB and Token Vault
- ✅ Fixed DynamoDB query with SK prefix
- ✅ Merge connections from both sources
- ✅ Detailed token retrieval logs

### **What to Expect:**
- ✅ Gmail connection persists after reload
- ✅ Detailed console logs for debugging
- ✅ Works even if DynamoDB partially fails
- ✅ Fallback to memory for local dev

### **How to Debug:**
- ✅ Check console logs at each step
- ✅ Verify token storage logs
- ✅ Verify token retrieval logs
- ✅ Check connection API logs
- ✅ Share logs if issues persist

---

**🎉 GMAIL CONNECTION - FULLY DEBUGGABLE!**

**With comprehensive logging, you can now:**
- ✅ See exactly where tokens are stored
- ✅ See exactly where tokens are retrieved from
- ✅ See exactly what connections are found
- ✅ Debug any issues immediately
- ✅ Understand the complete flow

**Next: Wait 10-15 min, test, and share console logs!** 🚀
