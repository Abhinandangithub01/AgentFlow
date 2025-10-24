# 🔴 CRITICAL: Missing Environment Variables in AWS Amplify

## ❌ The Problem

Your Auth0 login is failing with **HTTP 500 error** because AWS Amplify is **missing critical environment variables**.

Looking at your Amplify screenshot, you only have:
- ✅ `AUTH0_BASE_URL`

But you're **MISSING** these required variables:
- ❌ `AUTH0_SECRET`
- ❌ `AUTH0_ISSUER_BASE_URL`
- ❌ `AUTH0_CLIENT_ID`
- ❌ `AUTH0_CLIENT_SECRET`

---

## ✅ Solution: Add ALL Auth0 Environment Variables

### Step 1: Go to AWS Amplify Console

1. Open: https://console.aws.amazon.com/amplify
2. Click on your **AgentFlow** app
3. Go to: **App settings** → **Environment variables**
4. Click **"Manage variables"**

### Step 2: Add These Variables

Add **ALL** of these environment variables:

| Variable Name | Value |
|---------------|-------|
| `AUTH0_SECRET` | `a7b9c3d2e5f8g1h4i6j9k2l5m8n1o4p7q0r3s6t9u2v5w8x1y4z7a0b3c6d9e2f5` |
| `AUTH0_BASE_URL` | `https://main.d13senln5grdln.amplifyapp.com` |
| `AUTH0_ISSUER_BASE_URL` | `https://genai-9196568934621967.jp.auth0.com` |
| `AUTH0_CLIENT_ID` | `VutxaWRzFF3Te9UZ7zZ4u52ldfDsaLv5` |
| `AUTH0_CLIENT_SECRET` | `0SAjmFIsuILZIGzGlqEIKJ9-yGUt-WXOCN_mOEIktjADw9-OkfuYxumB3T-W61Eh` |
| `GROQ_API_KEY` | `your-groq-api-key-here` |

### Step 3: Save and Redeploy

1. Click **"Save"**
2. Go back to **Deployments**
3. Click **"Redeploy this version"**
4. Wait 3-5 minutes for deployment

---

## 🔍 How to Verify

After redeployment:

1. Visit: `https://main.d13senln5grdln.amplifyapp.com`
2. Click "Sign In with Auth0"
3. Should redirect to Auth0 login page ✅
4. After login, should redirect back to your dashboard ✅

---

## 📋 Complete Environment Variables Checklist

Make sure ALL these are in Amplify:

- [ ] `AUTH0_SECRET` - Random 64-character string
- [ ] `AUTH0_BASE_URL` - Your Amplify domain
- [ ] `AUTH0_ISSUER_BASE_URL` - Your Auth0 tenant URL
- [ ] `AUTH0_CLIENT_ID` - From Auth0 application
- [ ] `AUTH0_CLIENT_SECRET` - From Auth0 application
- [ ] `GROQ_API_KEY` - For AI features

---

## ⚠️ Why This Happened

The Auth0 SDK requires **ALL** these variables to work:
- `AUTH0_SECRET` - Encrypts session cookies
- `AUTH0_ISSUER_BASE_URL` - Auth0 tenant URL
- `AUTH0_CLIENT_ID` - Identifies your app
- `AUTH0_CLIENT_SECRET` - Authenticates your app

Without these, the `/api/auth/login` route **cannot initialize** and returns a 500 error.

---

## 🎯 Quick Copy-Paste for Amplify

```
AUTH0_SECRET=a7b9c3d2e5f8g1h4i6j9k2l5m8n1o4p7q0r3s6t9u2v5w8x1y4z7a0b3c6d9e2f5
AUTH0_BASE_URL=https://main.d13senln5grdln.amplifyapp.com
AUTH0_ISSUER_BASE_URL=https://genai-9196568934621967.jp.auth0.com
AUTH0_CLIENT_ID=VutxaWRzFF3Te9UZ7zZ4u52ldfDsaLv5
AUTH0_CLIENT_SECRET=0SAjmFIsuILZIGzGlqEIKJ9-yGUt-WXOCN_mOEIktjADw9-OkfuYxumB3T-W61Eh
GROQ_API_KEY=your-groq-api-key-here
```

---

**After adding these variables and redeploying, your Auth0 login will work!** 🎉
