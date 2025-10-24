# 🔐 Google OAuth Setup for Gmail Integration

This guide will help you set up Google OAuth credentials to enable Gmail integration in AgentFlow.

---

## 📋 Prerequisites

- Google Account
- Access to Google Cloud Console
- Your Amplify domain: `https://main.d13aenlm5qrdln.amplifyapp.com`

---

## ✅ Step 1: Create Google Cloud Project

1. Go to: **https://console.cloud.google.com/**
2. Click **"Select a project"** dropdown (top left)
3. Click **"NEW PROJECT"**
4. Enter project name: `AgentFlow`
5. Click **"CREATE"**
6. Wait for project creation (30 seconds)
7. Select the new project from the dropdown

---

## ✅ Step 2: Enable Gmail API

1. In Google Cloud Console, go to: **APIs & Services** → **Library**
2. Search for: `Gmail API`
3. Click on **Gmail API**
4. Click **"ENABLE"**
5. Wait for API to be enabled

---

## ✅ Step 3: Configure OAuth Consent Screen

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Select **"External"** (unless you have Google Workspace)
3. Click **"CREATE"**

### App Information:
- **App name**: `AgentFlow`
- **User support email**: Your email
- **App logo**: (optional)
- **Application home page**: `https://main.d13aenlm5qrdln.amplifyapp.com`
- **Application privacy policy**: `https://main.d13aenlm5qrdln.amplifyapp.com/privacy` (create this later)
- **Application terms of service**: `https://main.d13aenlm5qrdln.amplifyapp.com/terms` (create this later)
- **Authorized domains**: `amplifyapp.com`
- **Developer contact information**: Your email

4. Click **"SAVE AND CONTINUE"**

### Scopes:
5. Click **"ADD OR REMOVE SCOPES"**
6. Filter and select these scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/gmail.labels`
7. Click **"UPDATE"**
8. Click **"SAVE AND CONTINUE"**

### Test Users:
9. Click **"ADD USERS"**
10. Add your email address (and any test users)
11. Click **"ADD"**
12. Click **"SAVE AND CONTINUE"**
13. Review and click **"BACK TO DASHBOARD"**

---

## ✅ Step 4: Create OAuth Credentials

1. Go to: **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Select **Application type**: `Web application`
4. **Name**: `AgentFlow Web Client`

### Authorized JavaScript origins:
5. Click **"+ ADD URI"**
6. Add: `https://main.d13aenlm5qrdln.amplifyapp.com`

### Authorized redirect URIs:
7. Click **"+ ADD URI"**
8. Add: `https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback`

9. Click **"CREATE"**

### Save Your Credentials:
10. A popup will show your **Client ID** and **Client Secret**
11. **COPY BOTH** - you'll need them next!

Example:
```
Client ID: 123456789-abcdefghijklmnop.apps.googleusercontent.com
Client Secret: GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
```

---

## ✅ Step 5: Add Credentials to AWS Amplify

1. Go to: **https://console.aws.amazon.com/amplify**
2. Click your **AgentFlow** app
3. Go to: **App settings** → **Environment variables**
4. Click **"Manage variables"**
5. Add these 3 new variables:

| Variable Name | Value |
|---------------|-------|
| `GOOGLE_CLIENT_ID` | Your Client ID from step 4 |
| `GOOGLE_CLIENT_SECRET` | Your Client Secret from step 4 |
| `GOOGLE_REDIRECT_URI` | `https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback` |

6. Click **"Save"**

---

## ✅ Step 6: Redeploy Amplify App

1. Go to **Deployments** tab
2. Click **"Redeploy this version"**
3. Wait 3-5 minutes for deployment

---

## ✅ Step 7: Test Gmail Connection

1. Visit: `https://main.d13aenlm5qrdln.amplifyapp.com`
2. Sign in with Auth0
3. Go to **Integrations** page
4. Click **"Connect"** on Gmail card
5. You'll be redirected to Google OAuth
6. Select your Google account
7. Review and accept permissions
8. You'll be redirected back to AgentFlow
9. Gmail should show as **"✓ Connected"**

---

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"
**Problem**: The redirect URI doesn't match what's configured in Google Cloud Console

**Fix**:
1. Go to Google Cloud Console → Credentials
2. Click your OAuth client
3. Verify **Authorized redirect URIs** includes:
   ```
   https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback
   ```
4. Make sure there are no trailing slashes or typos

### Error: "Access blocked: Authorization Error"
**Problem**: OAuth consent screen not properly configured

**Fix**:
1. Go to OAuth consent screen
2. Make sure status is **"Testing"** or **"Published"**
3. Add your email to **Test users** if in Testing mode
4. Verify all required fields are filled

### Error: "invalid_client"
**Problem**: Client ID or Client Secret is wrong

**Fix**:
1. Go to Google Cloud Console → Credentials
2. Click your OAuth client
3. Copy the Client ID and Client Secret again
4. Update in Amplify environment variables
5. Redeploy

### Error: "Missing required parameter: client_id"
**Problem**: Environment variables not set in Amplify

**Fix**:
1. Verify all 3 Google variables are in Amplify:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`
2. Redeploy after adding them

---

## 📊 Complete Environment Variables Checklist

Make sure ALL these are in AWS Amplify:

### Auth0 Variables:
- [ ] `AUTH0_SECRET`
- [ ] `AUTH0_BASE_URL`
- [ ] `AUTH0_ISSUER_BASE_URL`
- [ ] `AUTH0_CLIENT_ID`
- [ ] `AUTH0_CLIENT_SECRET`

### Google OAuth Variables:
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GOOGLE_REDIRECT_URI`

### AI Variables:
- [ ] `GROQ_API_KEY`

---

## 🎯 Quick Reference

### Google Cloud Console URLs:
- **Console**: https://console.cloud.google.com/
- **APIs & Services**: https://console.cloud.google.com/apis/dashboard
- **Credentials**: https://console.cloud.google.com/apis/credentials
- **OAuth Consent**: https://console.cloud.google.com/apis/credentials/consent

### Your URLs:
- **App URL**: https://main.d13aenlm5qrdln.amplifyapp.com
- **Callback URL**: https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback
- **Authorized Origin**: https://main.d13aenlm5qrdln.amplifyapp.com

---

## 🔐 Security Best Practices

1. **Never commit credentials** to Git
2. **Use environment variables** for all secrets
3. **Rotate credentials** periodically
4. **Limit OAuth scopes** to only what's needed
5. **Monitor API usage** in Google Cloud Console
6. **Enable 2FA** on your Google account

---

**After completing these steps, Gmail integration will work!** 🎉

For more details, see: https://developers.google.com/gmail/api/guides
