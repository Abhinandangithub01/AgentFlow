# 🚀 Amplify-Only Setup (No Local Testing)

Since you're testing only on Amplify, you can skip localhost configuration.

---

## ✅ Step 1: Update Auth0 Dashboard

1. Go to: https://manage.auth0.com
2. Click: **Applications** → Your App → **Settings**
3. Update these fields (remove localhost, keep only Amplify):

**Allowed Callback URLs**:
```
https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/callback
```

**Allowed Logout URLs**:
```
https://main.d13aenlm5qrdln.amplifyapp.com
```

**Allowed Web Origins**:
```
https://main.d13aenlm5qrdln.amplifyapp.com
```

4. Click **"Save Changes"**

---

## ✅ Step 2: Configure AWS Amplify Environment Variables

1. Go to: https://console.aws.amazon.com/amplify
2. Click your **AgentFlow** app
3. Go to: **App settings** → **Environment variables**
4. Click **"Manage variables"**

### Add ALL These Variables:

| Variable | Value |
|----------|-------|
| `AUTH0_SECRET` | `a7b9c3d2e5f8g1h4i6j9k2l5m8n1o4p7q0r3s6t9u2v5w8x1y4z7a0b3c6d9e2f5` |
| `AUTH0_BASE_URL` | `https://main.d13aenlm5qrdln.amplifyapp.com` |
| `AUTH0_ISSUER_BASE_URL` | `https://genai-9196568934621967.jp.auth0.com` |
| `AUTH0_CLIENT_ID` | `VutxaWRzFF3Te9UZ7zZ4u52ldfDsaLv5` |
| `AUTH0_CLIENT_SECRET` | `0SAjmFIsuILZIGzGlqEIKJ9-yGUt-WXOCN_mOEIktjADw9-OkfuYxumB3T-W61Eh` |
| `GROQ_API_KEY` | `your-groq-api-key-here` |

5. Click **"Save"**

---

## ✅ Step 3: Redeploy

1. Go to **Deployments** tab in Amplify
2. Click **"Redeploy this version"**
3. Wait 3-5 minutes for deployment to complete

---

## ✅ Step 4: Test Your App

1. Visit: **https://main.d13aenlm5qrdln.amplifyapp.com**
2. You should see the landing page
3. Click **"Sign In with Auth0"**
4. You'll be redirected to Auth0 login
5. After login, you'll be redirected back to your dashboard

---

## 📋 Quick Checklist

### Auth0 Dashboard:
- [ ] Callback URL: `https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/callback`
- [ ] Logout URL: `https://main.d13aenlm5qrdln.amplifyapp.com`
- [ ] Web Origins: `https://main.d13aenlm5qrdln.amplifyapp.com`
- [ ] Changes saved

### AWS Amplify:
- [ ] `AUTH0_SECRET` set
- [ ] `AUTH0_BASE_URL` set to Amplify domain
- [ ] `AUTH0_ISSUER_BASE_URL` set
- [ ] `AUTH0_CLIENT_ID` set
- [ ] `AUTH0_CLIENT_SECRET` set
- [ ] `GROQ_API_KEY` set
- [ ] All variables saved
- [ ] App redeployed

### Testing:
- [ ] Wait 5 minutes after redeploy
- [ ] Visit Amplify URL
- [ ] Click "Sign In with Auth0"
- [ ] Login works ✅

---

## 🎯 Expected Flow

1. **Visit**: `https://main.d13aenlm5qrdln.amplifyapp.com`
2. **Click**: "Sign In with Auth0" button
3. **Redirect**: To Auth0 login page
4. **Login**: Enter your credentials
5. **Redirect**: Back to `https://main.d13aenlm5qrdln.amplifyapp.com/dashboard`
6. **Success**: You're logged in! 🎉

---

## ⚠️ If Login Still Fails

### Check Browser Console:
1. Press `F12` to open DevTools
2. Go to **Console** tab
3. Look for errors
4. Share the error message

### Check Amplify Logs:
1. Go to Amplify Console
2. Click **Monitoring** → **Logs**
3. Look for errors during deployment
4. Check if all env vars are set

### Verify Domain:
- Make sure you're using: `main.d13aenlm5qrdln.amplifyapp.com`
- NOT: `main.d13senln5grdln.amplifyapp.com` (typo)

---

## 🔍 Debug Commands

If you need to check what's deployed:

### Check Environment Variables:
1. Amplify Console → App settings → Environment variables
2. Verify all 6 variables are present

### Check Build Logs:
1. Amplify Console → Deployments → Latest deployment
2. Click on build logs
3. Look for any errors

### Check Runtime Logs:
1. Amplify Console → Monitoring → Logs
2. Filter by time range
3. Look for Auth0 errors

---

## 📞 Need Help?

If login still doesn't work after following all steps:

1. Take a screenshot of:
   - Auth0 callback URLs
   - Amplify environment variables
   - Browser console errors
   - Amplify logs

2. Share the error message you're seeing

---

**After completing these steps, your Auth0 login should work on Amplify!** 🚀
