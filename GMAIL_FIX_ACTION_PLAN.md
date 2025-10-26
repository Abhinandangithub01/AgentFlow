# 🎯 Gmail OAuth - Action Plan

## ✅ What I Fixed in Code

All code changes have been deployed! These are now live:

1. ✅ **Dynamic Redirect URIs** - Routes auto-detect your domain
2. ✅ **Better Error Handling** - Detailed logging in console
3. ✅ **Improved Callback** - Proper token storage
4. ✅ **Updated Environment Example** - Clear format requirements

---

## 🔴 CRITICAL: What YOU Need to Do Now

### **Step 1: Set Correct Client ID in Amplify (REQUIRED)**

The error shows your client ID is **incomplete**. 

❌ **Current (Wrong):** `355824659021-4eha7iy333o61fkiaefmee92teb0ora`
✅ **Required (Correct):** `355824659021-4eha7iy333o61fkiaefmee92teb0ora.apps.googleusercontent.com`

**Action:**
1. Go to AWS Amplify Console
2. Click on your app: **AgentFlow**
3. Go to **Environment variables**
4. Find `GOOGLE_CLIENT_ID`
5. Update it to the COMPLETE client ID with `.apps.googleusercontent.com`

```bash
GOOGLE_CLIENT_ID=355824659021-4eha7iy333o61fkiaefmee92teb0ora.apps.googleusercontent.com
```

### **Step 2: Verify Google Cloud Console Settings**

Go to: https://console.cloud.google.com/apis/credentials

1. **Click on your OAuth 2.0 Client ID**
2. **Verify these EXACT URIs:**

**Authorized redirect URIs (must be EXACT):**
```
https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback
```

**Authorized JavaScript origins:**
```
https://main.d13aenlm5qrdln.amplifyapp.com
```

3. **Click SAVE** if you made changes

### **Step 3: Enable Gmail API**

1. Go to: https://console.cloud.google.com/apis/library
2. Search: **"Gmail API"**
3. Click **ENABLE** (if not already enabled)

### **Step 4: Redeploy on Amplify**

After updating environment variables:

1. Go to Amplify Console
2. Click **Redeploy this version**
3. Wait 5-10 minutes for deployment

---

## 🧪 Test After Deployment

1. Visit: `https://main.d13aenlm5qrdln.amplifyapp.com`
2. Login with Auth0
3. Go to **Integrations**
4. Click **"Connect Gmail"**
5. **Expected:** Google OAuth consent screen (not error)
6. Grant permissions
7. **Expected:** Redirect back with success message

---

## 🐛 If Still Getting Error

### **Check Environment Variable**

Add this temporary debug route (I can help you):

Visit: `https://main.d13aenlm5qrdln.amplifyapp.com/api/debug/env`

Should show:
```json
{
  "clientId": "355824659021-4eha7iy333o61fki...",
  "clientSecret": "SET",
  "redirectUri": "https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback"
}
```

If `clientId` doesn't show full domain → Environment variable not updated correctly

### **Check Google Cloud Console**

1. Correct project selected?
2. OAuth client exists in THIS project?
3. Redirect URI EXACTLY matches (no trailing slash)?
4. Gmail API enabled?

---

## 📋 Quick Checklist

**In Amplify Console:**
- [ ] GOOGLE_CLIENT_ID = `355824659021-4eha7iy333o61fkiaefmee92teb0ora.apps.googleusercontent.com`
- [ ] GOOGLE_CLIENT_SECRET = (your secret from Google)
- [ ] Environment variables saved
- [ ] Redeployment triggered

**In Google Cloud Console:**
- [ ] Authorized redirect URI = `https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback`
- [ ] Authorized JavaScript origin = `https://main.d13aenlm5qrdln.amplifyapp.com`
- [ ] Gmail API enabled
- [ ] OAuth consent screen = "In production"

**Testing:**
- [ ] Clear browser cookies/cache
- [ ] Visit integrations page
- [ ] Click "Connect Gmail"
- [ ] See Google OAuth screen (not error)
- [ ] Grant permissions
- [ ] Redirected back with success

---

## 🎯 Summary

**The code is fixed and deployed. You just need to:**

1. **Update `GOOGLE_CLIENT_ID` in Amplify** (add `.apps.googleusercontent.com`)
2. **Verify redirect URIs in Google Console** (exact match required)
3. **Redeploy on Amplify**
4. **Test the OAuth flow**

**That's it!** Gmail OAuth will work after these steps.

---

## 📞 If You Need Help

Check `GMAIL_OAUTH_FIX.md` for detailed troubleshooting guide!
