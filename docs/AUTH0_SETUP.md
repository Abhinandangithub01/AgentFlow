# 🔧 Fix Auth0 Login Error on Amplify

## 🐛 The Problem

**Error**: HTTP 500 - Internal Server Error when trying to login
**URL**: `https://main.d13senln5grdln.amplifyapp.com/api/auth/login`

**Root Cause**: Auth0 is not configured to accept callbacks from your Amplify domain.

---

## ✅ Solution: Update Auth0 Configuration

### Step 1: Get Your Amplify URL

Your Amplify URL is:
```
https://main.d13senln5grdln.amplifyapp.com
```

### Step 2: Update Auth0 Application Settings

1. **Go to Auth0 Dashboard**:
   - Visit: https://manage.auth0.com
   - Login to your account

2. **Navigate to Your Application**:
   - Click "Applications" → "Applications"
   - Find your application (the one with Client ID: `VutxaWRzFF3Te9UZ7zZ4u52ldfDsaLv5`)
   - Click on it

3. **Update Application URIs**:

   **Allowed Callback URLs** (add these):
   ```
   http://localhost:3000/api/auth/callback,
   https://main.d13senln5grdln.amplifyapp.com/api/auth/callback
   ```

   **Allowed Logout URLs** (add these):
   ```
   http://localhost:3000,
   https://main.d13senln5grdln.amplifyapp.com
   ```

   **Allowed Web Origins** (add these):
   ```
   http://localhost:3000,
   https://main.d13senln5grdln.amplifyapp.com
   ```

4. **Click "Save Changes"**

---

### Step 3: Update Amplify Environment Variables

1. **Go to AWS Amplify Console**:
   - Navigate to your AgentFlow app
   - Click "App settings" → "Environment variables"

2. **Update AUTH0_BASE_URL**:
   
   **Current** (wrong):
   ```
   AUTH0_BASE_URL=http://localhost:3000
   ```

   **Change to**:
   ```
   AUTH0_BASE_URL=https://main.d13senln5grdln.amplifyapp.com
   ```

3. **Verify Other Variables**:
   
   Make sure these are set:
   ```
   AUTH0_SECRET=a7b9c3d2e5f8g1h4i6j9k2l5m8n1o4p7q0r3s6t9u2v5w8x1y4z7a0b3c6d9e2f5
   AUTH0_ISSUER_BASE_URL=https://genai-9196568934621967.jp.auth0.com
   AUTH0_CLIENT_ID=VutxaWRzFF3Te9UZ7zZ4u52ldfDsaLv5
   AUTH0_CLIENT_SECRET=0SAjmFIsuILZIGzGlqEIKJ9-yGUt-WXOCN_mOEIktjADw9-OkfuYxumB3T-W61Eh
   GROQ_API_KEY=your-groq-api-key-here
   ```

4. **Click "Save"**

5. **Redeploy**:
   - Click "Redeploy this version" or trigger a new build

---

## 🔍 Verification Steps

After making these changes:

1. **Wait for Amplify to redeploy** (~3-5 minutes)

2. **Test Login**:
   - Visit: `https://main.d13senln5grdln.amplifyapp.com`
   - Click "Sign In with Auth0"
   - Should redirect to Auth0 login page
   - After login, should redirect back to your app

3. **Expected Flow**:
   ```
   Your App → Auth0 Login → Auth0 Callback → Dashboard
   ```

---

## 📋 Quick Checklist

### Auth0 Dashboard:
- [ ] Allowed Callback URLs includes Amplify domain
- [ ] Allowed Logout URLs includes Amplify domain
- [ ] Allowed Web Origins includes Amplify domain
- [ ] Changes saved

### AWS Amplify:
- [ ] AUTH0_BASE_URL set to Amplify domain
- [ ] All other Auth0 variables present
- [ ] Environment variables saved
- [ ] App redeployed

---

## 🚨 Common Issues

### Issue 1: Still Getting 500 Error
**Solution**: 
- Clear browser cache
- Try incognito/private window
- Wait 5 minutes for Auth0 changes to propagate

### Issue 2: Redirect Loop
**Solution**:
- Verify AUTH0_BASE_URL matches exactly (no trailing slash)
- Check Auth0 callback URLs are correct

### Issue 3: "Callback URL Mismatch"
**Solution**:
- Double-check the callback URL in Auth0 includes `/api/auth/callback`
- Ensure no typos in the domain

---

## 📸 Screenshots Guide

### Auth0 Dashboard - Application Settings:

**Allowed Callback URLs**:
```
http://localhost:3000/api/auth/callback, https://main.d13senln5grdln.amplifyapp.com/api/auth/callback
```

**Allowed Logout URLs**:
```
http://localhost:3000, https://main.d13senln5grdln.amplifyapp.com
```

**Allowed Web Origins**:
```
http://localhost:3000, https://main.d13senln5grdln.amplifyapp.com
```

### AWS Amplify - Environment Variables:

| Key | Value |
|-----|-------|
| AUTH0_BASE_URL | `https://main.d13senln5grdln.amplifyapp.com` |
| AUTH0_ISSUER_BASE_URL | `https://genai-9196568934621967.jp.auth0.com` |
| AUTH0_CLIENT_ID | `VutxaWRzFF3Te9UZ7zZ4u52ldfDsaLv5` |
| AUTH0_CLIENT_SECRET | `0SAjmFIsuILZIGzGlqEIKJ9-yGUt-WXOCN_mOEIktjADw9-OkfuYxumB3T-W61Eh` |
| AUTH0_SECRET | `a7b9c3d2e5f8g1h4i6j9k2l5m8n1o4p7q0r3s6t9u2v5w8x1y4z7a0b3c6d9e2f5` |
| GROQ_API_KEY | `your-groq-api-key-here` |

---

## 🎯 Summary

**The Fix**:
1. Add Amplify domain to Auth0 allowed URLs
2. Update AUTH0_BASE_URL in Amplify environment variables
3. Redeploy

**Time Required**: ~5 minutes
**Downtime**: None (just redeploy)

---

**After these changes, your Auth0 login will work on Amplify!** 🎉
