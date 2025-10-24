# 🚨 URGENT: Fix Auth0 Login Now

## The Issue
Your Auth0 callback URLs have the **wrong domain**. That's why you're getting "This site can't be reached."

## ✅ Quick Fix (5 minutes)

### Step 1: Update Auth0 Dashboard

1. Go to: https://manage.auth0.com
2. Click: **Applications** → Your App → **Settings**
3. Update these fields with the **CORRECT** domain:

**Allowed Callback URLs**:
```
http://localhost:3000/api/auth/callback,
https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/callback
```

**Allowed Logout URLs**:
```
http://localhost:3000,
https://main.d13aenlm5qrdln.amplifyapp.com
```

**Allowed Web Origins**:
```
http://localhost:3000,
https://main.d13aenlm5qrdln.amplifyapp.com
```

4. Click **"Save Changes"**

---

### Step 2: Update AWS Amplify

1. Go to: https://console.aws.amazon.com/amplify
2. Click your **AgentFlow** app
3. Go to: **App settings** → **Environment variables**
4. Update `AUTH0_BASE_URL` to:

```
https://main.d13aenlm5qrdln.amplifyapp.com
```

5. **Add these if missing**:

```
AUTH0_SECRET=a7b9c3d2e5f8g1h4i6j9k2l5m8n1o4p7q0r3s6t9u2v5w8x1y4z7a0b3c6d9e2f5
AUTH0_ISSUER_BASE_URL=https://genai-9196568934621967.jp.auth0.com
AUTH0_CLIENT_ID=VutxaWRzFF3Te9UZ7zZ4u52ldfDsaLv5
AUTH0_CLIENT_SECRET=0SAjmFIsuILZIGzGlqEIKJ9-yGUt-WXOCN_mOEIktjADw9-OkfuYxumB3T-W61Eh
GROQ_API_KEY=your-groq-api-key-here
```

6. Click **"Save"**

---

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy this version"**
3. Wait 3-5 minutes

---

### Step 4: Test

1. Visit: https://main.d13aenlm5qrdln.amplifyapp.com
2. Click "Sign In with Auth0"
3. Should work! ✅

---

## 📋 Checklist

- [ ] Auth0 callback URLs updated with correct domain
- [ ] Auth0 logout URLs updated
- [ ] Auth0 web origins updated
- [ ] Auth0 changes saved
- [ ] Amplify `AUTH0_BASE_URL` updated
- [ ] All 5 Auth0 env vars in Amplify
- [ ] Amplify redeployed
- [ ] Tested login (after 5 min)

---

## ⚠️ Common Mistakes

❌ **Wrong**: `d13senln5grdln` (typo)  
✅ **Correct**: `d13aenlm5qrdln`

❌ **Wrong**: Missing environment variables  
✅ **Correct**: All 5 Auth0 variables must be set

❌ **Wrong**: Not redeploying after changes  
✅ **Correct**: Always redeploy after env var changes

---

**After these fixes, your Auth0 login will work!** 🎉
