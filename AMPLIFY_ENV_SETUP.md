# 🚀 Amplify Environment Variables Setup

## CRITICAL: Set This Environment Variable in Amplify

To ensure Gmail OAuth redirects work correctly in production, you **MUST** set this environment variable in AWS Amplify:

### **Required Environment Variable**

Go to AWS Amplify Console → Your App → Environment variables → Add:

```bash
NEXT_PUBLIC_APP_URL=https://main.d13aenlm5qrdln.amplifyapp.com
```

**This is CRITICAL** - Without this, the OAuth callback will try to redirect to localhost instead of your Amplify URL.

---

## Complete Amplify Environment Variables

Here's the complete list of environment variables you should have in Amplify:

### **Auth0 Configuration**
```bash
AUTH0_SECRET=[your-auth0-secret]
AUTH0_BASE_URL=https://main.d13aenlm5qrdln.amplifyapp.com
AUTH0_ISSUER_BASE_URL=https://[your-tenant].auth0.com
AUTH0_CLIENT_ID=[your-auth0-client-id]
AUTH0_CLIENT_SECRET=[your-auth0-client-secret]
```

### **Groq API**
```bash
GROQ_API_KEY=[your-groq-api-key]
```

### **Google OAuth** (NO SPACES!)
```bash
GOOGLE_CLIENT_ID=355824659021-4eha7ivj333o61fkiaefmee92tsb0ora.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-[your-secret]
GOOGLE_REDIRECT_URI=https://main.d13aenlm5qrdln.amplifyapp.com/api/auth/gmail/callback
```

### **Application URL** ⚠️ CRITICAL
```bash
NEXT_PUBLIC_APP_URL=https://main.d13aenlm5qrdln.amplifyapp.com
```

---

## How to Add in Amplify

1. Go to **AWS Amplify Console**
2. Click on your app: **AgentFlow**
3. In left sidebar, go to **"Hosting" → "Environment variables"**
4. Click **"Manage variables"**
5. Add each variable listed above
6. Click **"Save"**
7. Amplify will automatically redeploy

---

## Verify After Deployment

After deployment completes (5-10 minutes):

1. Visit: `https://main.d13aenlm5qrdln.amplifyapp.com`
2. Login with Auth0
3. Go to Integrations
4. Click "Connect Gmail"
5. Grant permissions
6. **You should be redirected to:** `https://main.d13aenlm5qrdln.amplifyapp.com/integrations?connected=gmail`
7. **NOT to:** `localhost:3000` ❌

---

## Troubleshooting

### **Still redirecting to localhost?**

1. Check that `NEXT_PUBLIC_APP_URL` is set in Amplify
2. Make sure there are NO SPACES in the value
3. Redeploy the app
4. Clear browser cache
5. Try again

### **Getting 404 or redirect errors?**

1. Check all environment variables are set correctly
2. Make sure `GOOGLE_CLIENT_ID` has NO leading/trailing spaces
3. Verify `AUTH0_BASE_URL` matches your Amplify URL exactly
4. Check Amplify deployment logs for errors

---

## Why This Is Needed

The code now prioritizes environment variables:

```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||  // ← Uses this first (Amplify)
                process.env.AUTH0_BASE_URL ||       // ← Falls back to this
                request.url;                         // ← Last resort
```

Without `NEXT_PUBLIC_APP_URL`, it might use `request.url` which could be localhost in some contexts.

**Setting `NEXT_PUBLIC_APP_URL` ensures the app always uses the correct Amplify URL for redirects!**
