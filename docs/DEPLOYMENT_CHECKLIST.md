# 🚀 Deployment Checklist - Agent Platform

Use this checklist to ensure successful deployment to AWS Amplify.

## ✅ Pre-Deployment Checklist

### 1. Local Development Complete

- [ ] Application runs locally without errors (`npm run dev`)
- [ ] Auth0 login/logout works
- [ ] Dashboard displays correctly
- [ ] Agent details page loads
- [ ] Create agent flow works
- [ ] All pages are responsive

### 2. Auth0 Configuration

- [ ] Auth0 application created
- [ ] Domain, Client ID, and Client Secret obtained
- [ ] Local callback URLs configured
- [ ] `.env.local` file configured correctly
- [ ] Login/logout tested locally

### 3. AWS Prerequisites

- [ ] AWS account created
- [ ] AWS CLI installed
- [ ] AWS credentials configured:
  - Access Key ID: `your-aws-access-key-id`
  - Secret Access Key: `your-aws-secret-access-key`
- [ ] CodeCommit access verified

### 4. Code Ready

- [ ] All files committed
- [ ] Dependencies installed (`package-lock.json` exists)
- [ ] No console errors in browser
- [ ] TypeScript compiles (`npm run build`)
- [ ] `.gitignore` configured

## 🔧 Deployment Steps

### Step 1: Configure AWS CLI

```bash
aws configure
```

Input:
- AWS Access Key ID: `your-aws-access-key-id`
- AWS Secret Access Key: `your-aws-secret-access-key`
- Default region: `us-east-1`
- Default output format: `json`

**Verify:**
```bash
aws sts get-caller-identity
```

- [ ] AWS CLI configured
- [ ] Credentials verified

### Step 2: Run Deployment Script

```powershell
cd C:\Users\mail2\CascadeProjects\agent-platform
.\scripts\deploy-amplify.ps1
```

**What it does:**
- Creates CodeCommit repository
- Pushes code
- Creates Amplify app
- Connects branch
- Starts deployment

- [ ] Script completed without errors
- [ ] Note your App ID: `________________`

### Step 3: Configure Environment Variables in Amplify

Go to: https://console.aws.amazon.com/amplify

1. Select your app
2. Go to **App settings** → **Environment variables**
3. Click **Manage variables**

Add these variables:

| Key | Value | Example |
|-----|-------|---------|
| `AUTH0_SECRET` | Generate new 64-char string | `abc123...` |
| `AUTH0_BASE_URL` | Your Amplify URL | `https://main.dxxxxx.amplifyapp.com` |
| `AUTH0_ISSUER_BASE_URL` | Your Auth0 domain | `https://dev-xyz.auth0.com` |
| `AUTH0_CLIENT_ID` | From Auth0 app | `abc123xyz` |
| `AUTH0_CLIENT_SECRET` | From Auth0 app | `secret123` |
| `OPENAI_API_KEY` | (Optional) OpenAI key | `sk-...` |

**Generate new AUTH0_SECRET for production:**
```powershell
-join ((48..57) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

- [ ] All environment variables added
- [ ] Values double-checked
- [ ] AUTH0_SECRET regenerated (don't reuse local secret!)

### Step 4: Update Auth0 Production URLs

Get your Amplify URL from the console (e.g., `https://main.d123456.amplifyapp.com`)

Update Auth0 application settings:

**Allowed Callback URLs:**
```
http://localhost:3000/api/auth/callback,
https://main.d123456.amplifyapp.com/api/auth/callback
```

**Allowed Logout URLs:**
```
http://localhost:3000,
https://main.d123456.amplifyapp.com
```

**Allowed Web Origins:**
```
http://localhost:3000,
https://main.d123456.amplifyapp.com
```

- [ ] Production URLs added to Auth0
- [ ] Kept localhost URLs for development
- [ ] Saved changes in Auth0

### Step 5: Trigger Redeploy

After adding environment variables, redeploy:

Option A - Via Console:
1. Go to Amplify app
2. Click **Redeploy this version**

Option B - Via CLI:
```bash
aws amplify start-job --app-id YOUR_APP_ID --branch-name main --job-type RELEASE --region us-east-1
```

- [ ] Redeployment triggered
- [ ] Build completed successfully

### Step 6: Test Production Deployment

Visit your Amplify URL: `https://main.dxxxxxx.amplifyapp.com`

Test checklist:
- [ ] Landing page loads
- [ ] Click "Get Started"
- [ ] Redirected to Auth0 login
- [ ] Can sign up / log in
- [ ] Redirected back to dashboard
- [ ] Dashboard loads correctly
- [ ] Can navigate to agent details
- [ ] Can access create agent page
- [ ] Logout works
- [ ] Can log back in

## 🎯 Post-Deployment

### Performance Optimization

- [ ] Enable Amplify CDN caching
- [ ] Configure custom domain (optional)
- [ ] Enable HTTPS (automatic with Amplify)

### Monitoring

- [ ] Check Amplify build logs
- [ ] Monitor CloudWatch logs
- [ ] Set up error alerts

### Auth0 for AI Agents

For full functionality:

- [ ] Enable Auth0 for AI Agents in tenant
- [ ] Configure Token Vault
- [ ] Add service connections (Gmail, Slack, etc.)
- [ ] Test OAuth flows

### Documentation

- [ ] Update README with production URL
- [ ] Document any custom configurations
- [ ] Create user guide (if needed)

## 📝 Challenge Submission

### Required for Auth0 AI Challenge

- [ ] Application deployed and accessible
- [ ] Auth0 integration working
- [ ] Token Vault configured (for AI Agents)
- [ ] Testing credentials provided (if needed)
- [ ] Demo video/screenshots prepared
- [ ] Submission post written

### Submission Template

Your DEV.to post should include:

```markdown
# Agent Platform - Autonomous AI Agents with Auth0

## Live Demo
🔗 [https://your-app.amplifyapp.com](https://your-app.amplifyapp.com)

## Features
- ✅ User Authentication via Auth0
- ✅ Token Vault for secure credential management
- ✅ Fine-grained authorization
- ✅ Beautiful agent dashboard
- ✅ Real-time activity feeds

## Tech Stack
- Next.js 14, React, TypeScript
- Auth0 for AI Agents
- TailwindCSS, Framer Motion
- AWS Amplify

## How Auth0 for AI Agents is Used
[Explain your implementation]

## Screenshots
[Add screenshots]

## Source Code
[Your GitHub/CodeCommit link]
```

- [ ] Submission post drafted
- [ ] Screenshots added
- [ ] Source code accessible
- [ ] Testing instructions clear

## 🐛 Troubleshooting

### Build Fails on Amplify

**Check:**
1. Amplify build logs for errors
2. `amplify.yml` configuration
3. Node version compatibility
4. All dependencies in `package.json`

**Common fixes:**
```bash
# Update amplify.yml if needed
# Ensure Next.js version is compatible
# Check for missing dependencies
```

### Auth0 Redirect Loop

**Check:**
1. Callback URLs exactly match (including https://)
2. `AUTH0_BASE_URL` matches Amplify URL
3. `AUTH0_SECRET` is set in Amplify env vars
4. No trailing slashes in URLs

### Environment Variables Not Working

**Check:**
1. All variables added in Amplify console
2. App redeployed after adding variables
3. No typos in variable names
4. Values don't have extra quotes or spaces

### 404 on Routes

**Check:**
1. Next.js dynamic routes properly configured
2. `amplify.yml` has correct artifacts
3. App uses App Router (not Pages Router)

## 📊 Success Criteria

Your deployment is successful when:

✅ Production URL is accessible  
✅ Auth0 login/logout works  
✅ All pages load without errors  
✅ Dashboard shows agent data  
✅ Navigation between pages works  
✅ Responsive on mobile devices  
✅ No console errors  
✅ Fast page loads (< 3 seconds)  

## 🎉 You're Done!

Congratulations! Your Agent Platform is now live.

**Next steps:**
1. ✅ Test thoroughly
2. ✅ Prepare challenge submission
3. ✅ Submit to Auth0 AI Challenge
4. ✅ Share on social media!

---

## Quick Reference

**Amplify Console:**  
https://console.aws.amazon.com/amplify

**Auth0 Dashboard:**  
https://manage.auth0.com

**Your App URL:**  
`https://main.d______.amplifyapp.com` (fill in your app ID)

**Support:**
- Amplify: https://docs.amplify.aws
- Auth0: https://community.auth0.com
- Next.js: https://nextjs.org/docs

---

**Good luck with your deployment! 🚀**
