# 🔧 Gmail OAuth - COMPLETE FIX (Step by Step)

## 🔴 THE REAL PROBLEM

Your error: **"The OAuth client was not found"**

**This means**: The OAuth client with ID `355824659021-4eha7iy333o61fkiaefmee92teb0ora.apps.googleusercontent.com` **DOES NOT EXIST** in Google Cloud Console.

You **MUST CREATE** a new OAuth client. Setting environment variables alone won't work.

---

## ✅ COMPLETE SOLUTION (Follow Exactly)

### **STEP 1: Verify Current State**

First, let's check what's configured:

1. After deployment, visit this debug URL:
   ```
   https://main.d13aenlm5qrdln.amplifyapp.com/api/debug/gmail-oauth
   ```

2. You'll see your current configuration
3. Take note of the `client_id` and `redirect_uri`

---

### **STEP 2: Go to Google Cloud Console**

1. Visit: **https://console.cloud.google.com/apis/credentials**

2. **CRITICAL**: Check the project name at the top of the page
   - Is it your project?
   - Or someone else's?
   - Make sure you're in YOUR project!

3. Click the **project dropdown** (top left) to switch projects if needed

---

### **STEP 3: Check if OAuth Client Exists**

Look at the "OAuth 2.0 Client IDs" section:

**Do you see a client with this Client ID?**
```
355824659021-4eha7iy333o61fkiaefmee92teb0ora.apps.googleusercontent.com
```

#### **If YES** (Client exists):
- Click on it
- Go to Step 5 to update redirect URIs

#### **If NO** (Client doesn't exist - MOST LIKELY):
- This is your problem!
- Go to Step 4 to create it

---

### **STEP 4: Create NEW OAuth 2.0 Client** 

Since the client doesn't exist, create a new one:

#### **4a. Configure OAuth Consent Screen First**

1. Click **"OAuth consent screen"** in left sidebar
2. Select **"External"** user type
3. Click **"CREATE"**

**Fill in App Information:**
```
App name: AgentFlow
User support email: [your-email@example.com]
Developer contact: [your-email@example.com]
```

4. Click **"SAVE AND CONTINUE"**

**Add Scopes:**
1. Click **"ADD OR REMOVE SCOPES"**
2. Filter for "Gmail API"
3. Select these scopes:
   - ☑ `https://www.googleapis.com/auth/gmail.readonly`
   - ☑ `https://www.googleapis.com/auth/gmail.send`
   - ☑ `https://www.googleapis.com/auth/gmail.modify`
   - ☑ `https://www.googleapis.com/auth/gmail.labels`
4. Click **"UPDATE"**
5. Click **"SAVE AND CONTINUE"**

**Test Users:**
1. Click **"ADD USERS"**
2. Add your Gmail address
3. Click **"SAVE AND CONTINUE"**

**Publish App:**
1. Click **"BACK TO DASHBOARD"**
2. Click **"PUBLISH APP"** button
3. Click **"CONFIRM"**

#### **4b. Create OAuth Client**

1. Go back to: **https://console.cloud.google.com/apis/credentials**
2. Click **"+ CREATE CREDENTIALS"** button (top)
3. Select **"OAuth client ID"**

**Configure:**
```
Application type: Web application
Name: AgentFlow Gmail Integration
```

**Authorized JavaScript origins:** Click "+ ADD URI" and add:
```
https://main.d13aenlm5qrdln.amplifyapp.com
```

**Authorized redirect URIs:** Click "+ ADD URI" and add:
```
https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback
```

**For local development, also add:**
```
http://localhost:3000
http://localhost:3000/api/auth/gmail/callback
```

4. Click **"CREATE"**

5. **SAVE THE CREDENTIALS** that appear:
   - Client ID: `XXXXX.apps.googleusercontent.com`
   - Client secret: `GOCSPX-XXXXX`

---

### **STEP 5: Enable Gmail API**

1. Go to: **https://console.cloud.google.com/apis/library/gmail.googleapis.com**
2. Click **"ENABLE"** button
3. Wait for it to enable (takes a few seconds)

---

### **STEP 6: Update AWS Amplify Environment Variables**

1. Go to AWS Amplify Console
2. Select your app: **AgentFlow**
3. Go to **"Hosting" → "Environment variables"**
4. Update with your NEW credentials from Step 4b:

```bash
GOOGLE_CLIENT_ID=[paste-your-new-client-id].apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-[paste-your-new-secret]
```

**Optional (for explicit redirect):**
```bash
GOOGLE_REDIRECT_URI=https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback
```

5. Click **"Save"**
6. Amplify will automatically redeploy (wait 5-10 minutes)

---

### **STEP 7: Test the Flow**

After deployment completes:

1. **Clear browser cache completely**
   - Press `Ctrl + Shift + Delete`
   - Select "All time"
   - Check "Cached images and files"
   - Click "Clear data"

2. **Visit your app:**
   ```
   https://main.d13aenlm5qrdln.amplifyapp.com
   ```

3. **Login with Auth0**

4. **Go to Integrations page**

5. **Click "Connect Gmail"**

6. **Expected Result:**
   - ✅ You see Google OAuth consent screen
   - ✅ App name: "AgentFlow"
   - ✅ Scopes: Gmail permissions listed
   - ✅ You can grant access
   - ✅ Redirected back to your app with success

---

## 🔍 Troubleshooting

### **Still Getting "OAuth client was not found"?**

Check these:

1. **Wrong Google Project?**
   - Click project dropdown in Google Console
   - Make sure you're in YOUR project
   - The client must be in the SAME project where you enabled Gmail API

2. **Client ID Typo?**
   - In Amplify, verify GOOGLE_CLIENT_ID
   - Must match EXACTLY (including `.apps.googleusercontent.com`)
   - Copy-paste from Google Console, don't type manually

3. **Credentials Copied Wrong?**
   - When you click "CREATE" in Google Console, a popup shows credentials
   - Download the JSON or copy them immediately
   - If you closed it, create a NEW client

### **Getting "redirect_uri_mismatch"?**

This means the redirect URI in your code doesn't match Google Console:

1. Check what URI your app is using:
   ```
   https://main.d13aenlm5qrdln.amplifyapp.com/api/debug/gmail-oauth
   ```

2. Go to Google Console → Your OAuth Client → Edit
3. Make sure "Authorized redirect URIs" includes EXACT match:
   ```
   https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback
   ```
   No trailing slash, no extra paths, EXACT match!

### **Getting "access_denied"?**

1. OAuth consent screen might be in "Testing" mode
2. Go to OAuth consent screen settings
3. Click "PUBLISH APP"
4. Add your email to test users if still in testing

---

## 📋 Final Checklist

Before testing, verify ALL of these:

### **In Google Cloud Console:**
- [ ] Correct project selected (top dropdown)
- [ ] OAuth consent screen configured
- [ ] OAuth consent screen published (or email in test users)
- [ ] OAuth 2.0 Client ID created
- [ ] Redirect URI: `https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback`
- [ ] JavaScript origin: `https://main.d13aenlm5qrdln.amplifyapp.com`
- [ ] Gmail API enabled
- [ ] Credentials downloaded/copied

### **In AWS Amplify:**
- [ ] GOOGLE_CLIENT_ID set to complete client ID with `.apps.googleusercontent.com`
- [ ] GOOGLE_CLIENT_SECRET set to complete secret starting with `GOCSPX-`
- [ ] Environment variables saved
- [ ] App redeployed (check deployment status)
- [ ] Build succeeded (no errors in logs)

### **Testing:**
- [ ] Browser cache cleared
- [ ] Visited app fresh
- [ ] Logged in with Auth0
- [ ] Clicked "Connect Gmail"
- [ ] Saw Google OAuth screen (not error)
- [ ] Granted permissions
- [ ] Redirected back successfully

---

## 🎯 Common Mistakes to Avoid

1. ❌ **Using old client ID that doesn't exist**
   → ✅ Create NEW OAuth client

2. ❌ **Forgetting to enable Gmail API**
   → ✅ Enable it in Google Console

3. ❌ **OAuth consent screen not published**
   → ✅ Publish app or add email to test users

4. ❌ **Wrong redirect URI format**
   → ✅ Use exact format: `https://domain.com/api/auth/gmail/callback`

5. ❌ **Wrong Google project**
   → ✅ Verify project name at top of console

6. ❌ **Not redeploying Amplify after env changes**
   → ✅ Wait for automatic redeploy to finish

7. ❌ **Browser cache showing old error**
   → ✅ Clear cache completely and hard refresh

---

## 💡 Why This Happens

The client ID in your environment variables (`355824659021-4eha7iy333o61fkiaefmee92teb0ora.apps.googleusercontent.com`) is probably:

1. From a different Google project
2. From someone else's tutorial/example
3. Was deleted
4. Never existed

**Solution**: Create YOUR OWN OAuth client in YOUR Google Cloud project.

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Debug endpoint shows config correctly
2. ✅ Clicking "Connect Gmail" opens Google OAuth page
3. ✅ You see "AgentFlow" as app name
4. ✅ You see Gmail scopes listed
5. ✅ After granting, you're redirected back
6. ✅ You see "Gmail connected successfully" message

---

## 📞 Still Not Working?

If you followed EVERY step above and still get errors:

1. Visit the debug endpoint and screenshot the output
2. Open browser DevTools (F12) → Console
3. Screenshot any errors
4. Check Amplify deployment logs for errors
5. Share all screenshots

**The most common issue is**: OAuth client not created in Google Console. Make sure you complete Step 4!

---

**Follow this guide step-by-step, and Gmail OAuth will work!** 🎉
