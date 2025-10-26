# 🔴 Gmail OAuth: "Client Not Found" - Solution

## 🐛 The Problem

Google says: **"The OAuth client was not found"**

Your client ID in Amplify: `355824659021-4eha7iy333o61fkiaefmee92teb0ora.apps.googleusercontent.com`

This error means Google doesn't recognize this client ID. **The OAuth client either doesn't exist or was deleted.**

---

## ✅ SOLUTION: Create New OAuth Client

You need to create a NEW OAuth 2.0 Client in Google Cloud Console.

### **Step 1: Go to Google Cloud Console**

1. Visit: https://console.cloud.google.com/apis/credentials
2. **Make sure you're in the correct project** (check project name at top)

### **Step 2: Create OAuth 2.0 Client ID**

1. Click **"+ CREATE CREDENTIALS"** button at top
2. Select **"OAuth client ID"**
3. If prompted, configure OAuth consent screen first (see Step 3)

**Application type:** Web application

**Name:** AgentFlow Gmail Integration

**Authorized JavaScript origins:** Add this URL:
```
https://main.d13aenlm5qrdln.amplifyapp.com
```

**Authorized redirect URIs:** Add this EXACT URL:
```
https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback
```

4. Click **CREATE**

5. **SAVE the Client ID and Client Secret** that appear!

### **Step 3: Configure OAuth Consent Screen** (if not done)

If you see "OAuth consent screen not configured":

1. Click **"OAuth consent screen"** in left sidebar
2. Select **External** user type
3. Click **CREATE**
4. Fill in required fields:
   - **App name:** AgentFlow
   - **User support email:** Your email
   - **Developer contact email:** Your email
5. Click **SAVE AND CONTINUE**
6. On "Scopes" page, click **ADD OR REMOVE SCOPES**
7. Filter for "Gmail API" and add:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/gmail.labels`
8. Click **UPDATE** then **SAVE AND CONTINUE**
9. On "Test users" page, add your email
10. Click **SAVE AND CONTINUE**
11. Review and click **BACK TO DASHBOARD**
12. Click **"PUBLISH APP"** button
13. Confirm by clicking **CONFIRM**

### **Step 4: Enable Gmail API**

1. Go to: https://console.cloud.google.com/apis/library
2. Search: **Gmail API**
3. Click on it
4. Click **ENABLE** button
5. Wait for it to enable

### **Step 5: Update Amplify Environment Variables**

1. Go to AWS Amplify Console
2. Go to **Environment variables**
3. Update these with your NEW credentials:

```bash
GOOGLE_CLIENT_ID=<paste-new-client-id-here>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-<paste-new-secret-here>
GOOGLE_REDIRECT_URI=https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback
```

4. Click **Save**
5. Click **Redeploy this version**

---

## 🧪 Test After Setup

1. Wait for Amplify deployment (5-10 minutes)
2. Visit: `https://main.d13aenlm5qrdln.amplifyapp.com`
3. Login
4. Go to Integrations
5. Click "Connect Gmail"
6. Should see Google OAuth consent screen ✅
7. Grant permissions
8. Should redirect back with success ✅

---

## 📋 Quick Checklist

**In Google Cloud Console:**
- [ ] Correct project selected (check project name at top)
- [ ] OAuth consent screen configured
- [ ] OAuth consent screen published
- [ ] OAuth 2.0 Client ID created
- [ ] Authorized redirect URI = `https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback`
- [ ] Gmail API enabled
- [ ] Client ID and Secret copied

**In AWS Amplify:**
- [ ] GOOGLE_CLIENT_ID updated with NEW client ID
- [ ] GOOGLE_CLIENT_SECRET updated with NEW secret
- [ ] Environment variables saved
- [ ] App redeployed

**Testing:**
- [ ] Clear browser cookies/cache
- [ ] Visit integrations page
- [ ] Click "Connect Gmail"
- [ ] See Google OAuth screen (not error)

---

## 🔍 Why This Happened

Possible reasons:
1. OAuth client was never created
2. OAuth client was deleted
3. Wrong Google Cloud project
4. Client ID has a typo

**Creating a new OAuth client fixes all of these!**

---

## 💡 Important Notes

### **For Local Development**

When testing locally, also add to Google Cloud Console:

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/gmail/callback
```

### **Multiple Environments**

You can have multiple redirect URIs for different environments:
- Production: `https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback`
- Staging: `https://staging.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback`
- Local: `http://localhost:3000/api/auth/gmail/callback`

Just add all of them to the same OAuth client!

---

## 🎯 Summary

**The OAuth client doesn't exist in Google Cloud Console.**

**Solution:**
1. Create NEW OAuth 2.0 Client in Google Console
2. Configure OAuth consent screen
3. Enable Gmail API
4. Update Amplify environment variables with NEW credentials
5. Redeploy
6. Test

**After these steps, Gmail OAuth will work!** 🎉
