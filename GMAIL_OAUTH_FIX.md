# 🔧 Gmail OAuth Fix - Complete Solution

## 🐛 Issues Identified

Based on the error screenshots, here are the problems:

### **1. OAuth Client Error**
```
invalid_client - The OAuth client was not found
```
**Client ID in Error:** `355824659021-4eha7iy333o61fkiaefmee92teb0ora`
**Issue:** Client ID might be incomplete or incorrectly configured

### **2. Route Mismatch**
- **Google Console:** `/api/auth/gmail/callback`
- **Your Redirect URI:** Must match exactly

### **3. Environment Variables**
- Client ID must be EXACTLY: `355824659021-4eha7iy333o61fkiaefmee92teb0ora.apps.googleusercontent.com`
- Redirect URI for production: `https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback`

---

## ✅ Solution

### **Step 1: Update Environment Variables in AWS Amplify**

Go to AWS Amplify Console → Environment variables and set:

```bash
# CRITICAL: Use the COMPLETE client ID from Google Cloud Console
GOOGLE_CLIENT_ID=355824659021-4eha7iy333o61fkiaefmee92teb0ora.apps.googleusercontent.com

# Get this from Google Cloud Console → Credentials
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-secret-here

# For production (Amplify)
GOOGLE_REDIRECT_URI=https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback

# For local development
# GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/gmail/callback
```

### **Step 2: Verify Google Cloud Console Settings**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Verify these settings:

**Authorized JavaScript origins:**
```
https://main.d13aenlm5qrdln.amplifyapp.com
```

**Authorized redirect URIs:**
```
https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback
```

**For local development, also add:**
```
http://localhost:3000
http://localhost:3000/api/auth/gmail/callback
```

### **Step 3: Enable Gmail API**

1. Go to: https://console.cloud.google.com/apis/library
2. Search for "Gmail API"
3. Click "ENABLE"

### **Step 4: Verify OAuth Consent Screen**

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Ensure "Publishing status" is "In production" (✅ as shown in screenshot)
3. Verify scopes include:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/gmail.labels`

---

## 🔍 Debugging Steps

### **1. Check Environment Variables**

Create a debug API route to verify (REMOVE after testing):

```typescript
// app/api/debug/gmail-config/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  });
}
```

Visit: `https://main.d13aenlm5qrdln.amplifyapp.com/api/debug/gmail-config`

### **2. Test OAuth Flow**

1. Visit: `https://main.d13aenlm5qrdln.amplifyapp.com/integrations`
2. Click "Connect Gmail"
3. Should redirect to Google OAuth
4. After authorization, should redirect back to your app

### **3. Check Console Logs**

In Amplify Console → Logs, look for:
```
Gmail OAuth Config: {
  clientId: '355824659021-4eha7iy...',
  clientSecret: 'SET',
  redirectUri: 'https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback'
}
```

---

## 📋 Checklist

Before testing, verify ALL of these:

### **Google Cloud Console**
- [ ] Project created
- [ ] Gmail API enabled
- [ ] OAuth consent screen configured
- [ ] Publishing status: "In production"
- [ ] Client ID created
- [ ] Authorized JavaScript origins set
- [ ] Authorized redirect URIs set (EXACT match)

### **Environment Variables (Amplify)**
- [ ] `GOOGLE_CLIENT_ID` - Complete client ID with `.apps.googleusercontent.com`
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- [ ] `GOOGLE_REDIRECT_URI` - EXACT: `https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback`

### **Local Development (.env.local)**
- [ ] `GOOGLE_CLIENT_ID` - Same as production
- [ ] `GOOGLE_CLIENT_SECRET` - Same as production
- [ ] `GOOGLE_REDIRECT_URI` - `http://localhost:3000/api/auth/gmail/callback`

### **Code**
- [ ] Route exists at `/api/auth/gmail/callback`
- [ ] Route exists at `/api/connections/gmail/connect` (if using)
- [ ] Scopes match Google Console
- [ ] No hardcoded redirect URIs

---

## 🚨 Common Mistakes

### **1. Incomplete Client ID**
❌ `355824659021-4eha7iy333o61fkiaefmee92teb0ora`
✅ `355824659021-4eha7iy333o61fkiaefmee92teb0ora.apps.googleusercontent.com`

### **2. Wrong Redirect URI**
❌ `https://d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback`
✅ `https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback`

### **3. Missing Protocol**
❌ `main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback`
✅ `https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback`

### **4. Trailing Slash**
❌ `https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback/`
✅ `https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback`

### **5. Not Enabling Gmail API**
- Must explicitly enable Gmail API in Google Cloud Console
- Not just OAuth consent screen

---

## 🎯 Quick Test

Run this test sequence:

1. **Clear cookies/cache**
2. **Visit your app:** `https://main.d13aenlm5qrdln.amplifyapp.com`
3. **Login with Auth0**
4. **Go to Integrations**
5. **Click "Connect Gmail"**
6. **Should see Google OAuth screen** (not error page)
7. **Grant permissions**
8. **Should redirect back with success**

---

## 📱 What You Should See

### **Step 1: Click Connect Gmail**
You should be redirected to Google with URL like:
```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=355824659021-4eha7iy333o61fkiaefmee92teb0ora.apps.googleusercontent.com
  &redirect_uri=https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback
  &scope=...
```

### **Step 2: Google OAuth Consent**
- App name: AgentFlow
- Scopes: Read, send, modify emails
- Your Google account selection

### **Step 3: Success Redirect**
```
https://main.d13aenlm5qrdln.amplifyapp.com/integrations?connected=gmail
```

---

## 🔧 If Still Failing

### **Check These:**

1. **Client ID in Amplify**
   ```bash
   # In Amplify Console, verify it shows EXACTLY:
   GOOGLE_CLIENT_ID=355824659021-4eha7iy333o61fkiaefmee92teb0ora.apps.googleusercontent.com
   ```

2. **Google Cloud Project**
   - Correct project selected?
   - Gmail API enabled in THIS project?
   - OAuth client created in THIS project?

3. **OAuth Consent Screen**
   - Status: "In production"
   - Test users added (if in testing mode)
   - All scopes added

4. **Amplify Deployment**
   - Latest code deployed?
   - Environment variables saved?
   - Redeployment triggered?

---

## 📞 Support Resources

- **Google OAuth Documentation:** https://developers.google.com/identity/protocols/oauth2
- **Gmail API Documentation:** https://developers.google.com/gmail/api
- **OAuth Playground:** https://developers.google.com/oauthplayground/

---

## ✅ Expected Result

After fixing:
- ✅ Click "Connect Gmail" → Google OAuth screen
- ✅ Grant permissions → Redirect back to app
- ✅ Success message: "Gmail connected"
- ✅ Can read/send emails through the app

---

**Follow these steps exactly and Gmail OAuth will work!** 🎉
