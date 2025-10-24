# 🔧 Amplify Environment Variables Troubleshooting

## 🔴 Problem: Environment Variables Not Loading

You've added `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` to Amplify, but they're showing as MISSING.

---

## ✅ Solution Steps

### Step 1: Verify Variable Names in Amplify

Go to Amplify Console → Environment variables and check:

**EXACT names required:**
```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
```

**Common mistakes:**
- ❌ `Google_Client_ID` (wrong case)
- ❌ `GOOGLE_CLIENT` (missing _ID)
- ❌ `GOOGLE_REDIRECT_URL` (should be _URI)
- ❌ Extra spaces in names

### Step 2: Check Variable Scope

Make sure variables are set for **"All branches"** not just specific branches.

In Amplify:
1. Environment variables page
2. Look at the "Branch" column
3. Should say **"All branches"**

### Step 3: Verify Values Have No Extra Characters

Common issues:
- ❌ Spaces before/after the value
- ❌ Quotes around the value (don't add quotes)
- ❌ Line breaks in the value

**Correct format:**
```
Variable: GOOGLE_CLIENT_ID
Value: 355824659021-4eha7iy333o61fkiaefmee92teb0ora.apps.googleusercontent.com
```

**NOT:**
```
Value: "355824659021-4eha7iy333o61fkiaefmee92teb0ora.apps.googleusercontent.com"
Value:  355824659021-4eha7iy333o61fkiaefmee92teb0ora.apps.googleusercontent.com 
```

### Step 4: Full Rebuild Required

Environment variable changes require a **FULL REBUILD**, not just redeploy.

**How to trigger full rebuild:**

#### Option A: From Amplify Console
1. Go to **Deployments** tab
2. Click latest deployment
3. Click **"Redeploy this version"**
4. Wait for **"Provision"** → **"Build"** → **"Deploy"** stages
5. Must see "Build" stage, not just "Deploy"

#### Option B: Clear Build Cache
1. Go to **App settings** → **Build settings**
2. Scroll to bottom
3. Click **"Clear cache and redeploy"**
4. Wait 5-7 minutes

### Step 5: Check Build Logs

After rebuild:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **"Build"** stage
4. Look for errors related to environment variables

---

## 🔍 Diagnostic Checklist

After full rebuild, visit:
```
https://main.d13aenlm5qrdln.amplifyapp.com/api/debug/env
```

**Expected result:**
```json
{
  "status": {
    "GOOGLE_CLIENT_ID": "SET",
    "GOOGLE_CLIENT_SECRET": "SET",
    "GOOGLE_REDIRECT_URI": "SET"
  }
}
```

**If still MISSING:**
- Screenshot the Amplify environment variables page
- Check if variables are in the correct app (not a different Amplify app)
- Verify you're looking at the right branch (main)

---

## 🎯 Alternative: Use AWS CLI to Set Variables

If the console isn't working, use AWS CLI:

```powershell
# Set environment variables via AWS CLI
aws amplify update-app `
  --app-id YOUR_APP_ID `
  --region YOUR_REGION `
  --environment-variables `
    GOOGLE_CLIENT_ID=your-client-id,`
    GOOGLE_CLIENT_SECRET=your-client-secret,`
    GOOGLE_REDIRECT_URI=https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback
```

Then trigger rebuild:
```powershell
aws amplify start-job `
  --app-id YOUR_APP_ID `
  --branch-name main `
  --job-type RELEASE `
  --region YOUR_REGION
```

---

## 📋 Complete Variable List

Make sure ALL these are in Amplify:

| Variable | Status | Value Example |
|----------|--------|---------------|
| `AUTH0_SECRET` | ✅ Working | `a7b9c3d2e5f8...` |
| `AUTH0_BASE_URL` | ✅ Working | `https://main.d13aenlm5qrdln.amplifyapp.com` |
| `AUTH0_ISSUER_BASE_URL` | ✅ Working | `https://genai-9196568934621967.jp.auth0.com` |
| `AUTH0_CLIENT_ID` | ✅ Working | `VutxaWRzFF3Te9UZ7zZ4u52ldfDsaLv5` |
| `AUTH0_CLIENT_SECRET` | ✅ Working | `0SAjmFIsuILZIGzGlqEIKJ9-yGUt-WXOCN_mOEIktjADw9-OkfuYxumB3T-W61Eh` |
| `GOOGLE_CLIENT_ID` | ❌ Missing | `355824659021-4eha7iy333o61fkiaefmee92teb0ora.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | ❌ Missing | `GOCSPX-i8gOzaoICXAbH1s-NMlrxH9mycZ` |
| `GOOGLE_REDIRECT_URI` | ❌ Missing | `https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback` |
| `GROQ_API_KEY` | ⚠️ Optional | `gsk_...` |

---

## 🚨 If Nothing Works

### Last Resort: Delete and Re-add

1. **Delete** all Google variables from Amplify
2. **Save** (with them deleted)
3. **Redeploy** once
4. **Add** them back with exact names
5. **Save**
6. **Clear cache and redeploy**

### Check App ID

Make sure you're editing the correct Amplify app:
- App name should match your project
- Domain should be `d13aenlm5qrdln.amplifyapp.com`

---

## 📸 What to Share for Help

If still not working, share screenshots of:
1. Amplify environment variables page (all variables visible)
2. Latest deployment build logs
3. Output of `/api/debug/env` endpoint

---

**The variables MUST load after a full rebuild. If they don't, there's something wrong with how they're configured in Amplify.**
