# Setup Guide - Agent Platform

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd agent-platform
npm install
```

### Step 2: Configure Auth0

#### Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Click **Applications** → **Create Application**
3. Choose **Regular Web Applications**
4. Click **Create**

#### Configure Application Settings

In your Auth0 application settings:

```
Application Name: Agent Platform
Application Type: Regular Web Application

Allowed Callback URLs:
http://localhost:3000/api/auth/callback
https://your-domain.amplifyapp.com/api/auth/callback

Allowed Logout URLs:
http://localhost:3000
https://your-domain.amplifyapp.com

Allowed Web Origins:
http://localhost:3000
https://your-domain.amplifyapp.com
```

#### Enable Auth0 for AI Agents

1. In your Auth0 Dashboard, go to **Settings** → **Advanced**
2. Enable **Auth0 for AI Agents** (if available)
3. Follow the guide: https://auth0.com/ai/docs/get-started/user-authentication

#### Get Your Credentials

Copy these from your Auth0 application:
- **Domain** (e.g., `dev-abc123.us.auth0.com`)
- **Client ID**
- **Client Secret**

### Step 3: Set Up Environment Variables

Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Generate this with: openssl rand -hex 32
AUTH0_SECRET='your-32-character-secret-here'

# For local development
AUTH0_BASE_URL='http://localhost:3000'

# Your Auth0 tenant (add https://)
AUTH0_ISSUER_BASE_URL='https://dev-abc123.us.auth0.com'

# From Auth0 application settings
AUTH0_CLIENT_ID='your-client-id-here'
AUTH0_CLIENT_SECRET='your-client-secret-here'

# Optional: For AI features
OPENAI_API_KEY='sk-...'
```

**Generate AUTH0_SECRET:**
```bash
openssl rand -hex 32
```

Or use online generator: https://generate-secret.vercel.app/32

### Step 4: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## 🔐 Auth0 Token Vault Setup

### Configure Service Connections

For demo agents to work with real services:

1. **Gmail Integration**
   - Go to Auth0 Dashboard → Authentication → Social
   - Enable Google OAuth
   - Add scopes: `gmail.readonly`, `gmail.send`

2. **Slack Integration**
   - Go to Auth0 Dashboard → Authentication → Social
   - Enable Slack OAuth
   - Add scopes: `chat:write`, `users:read`

3. **Store in Token Vault**
   - Follow: https://auth0.com/ai/docs/how-tos/token-vault

## 🚀 Deploy to AWS Amplify

### Prerequisites

- AWS Account
- AWS CLI installed and configured
- CodeCommit repository access

### Step 1: Configure AWS CLI

```bash
aws configure
```

Enter your credentials:
- AWS Access Key ID: `your-aws-access-key-id`
- AWS Secret Access Key: `your-aws-secret-access-key`
- Region: `us-east-1`
- Output format: `json`

### Step 2: Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit: Agent Platform"
```

### Step 3: Create CodeCommit Repository

```bash
# Create repository
aws codecommit create-repository \
  --repository-name agent-platform \
  --repository-description "Agent Platform - Autonomous AI Agents" \
  --region us-east-1
```

### Step 4: Push to CodeCommit

```bash
# Configure CodeCommit credentials
git config --global credential.helper '!aws codecommit credential-helper $@'
git config --global credential.UseHttpPath true

# Add remote
git remote add origin https://git-codecommit.us-east-1.amazonaws.com/v1/repos/agent-platform

# Push code
git push -u origin main
```

### Step 5: Create Amplify App

```bash
# Create Amplify app
aws amplify create-app \
  --name agent-platform \
  --repository codecommit://agent-platform \
  --platform WEB \
  --region us-east-1
```

Note the `appId` from the output.

### Step 6: Connect Branch and Deploy

```bash
# Get your app ID from previous step
APP_ID="your-app-id-here"

# Create branch
aws amplify create-branch \
  --app-id $APP_ID \
  --branch-name main \
  --region us-east-1

# Start deployment
aws amplify start-job \
  --app-id $APP_ID \
  --branch-name main \
  --job-type RELEASE \
  --region us-east-1
```

### Step 7: Add Environment Variables in Amplify

Via AWS Console:

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Select your app
3. Go to **App settings** → **Environment variables**
4. Click **Manage variables**
5. Add all variables from `.env.local`:

```
AUTH0_SECRET=your-secret
AUTH0_BASE_URL=https://your-app.amplifyapp.com
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
OPENAI_API_KEY=your-openai-key
```

Or via CLI:

```bash
aws amplify update-app \
  --app-id $APP_ID \
  --environment-variables \
    AUTH0_SECRET="your-secret" \
    AUTH0_BASE_URL="https://your-app.amplifyapp.com" \
    AUTH0_ISSUER_BASE_URL="https://your-tenant.auth0.com" \
    AUTH0_CLIENT_ID="your-client-id" \
    AUTH0_CLIENT_SECRET="your-client-secret" \
    OPENAI_API_KEY="your-openai-key" \
  --region us-east-1
```

### Step 8: Update Auth0 URLs

Once deployed, get your Amplify URL (e.g., `https://main.d1a2b3c4d5e6f7.amplifyapp.com`)

Update Auth0 application settings:
- **Allowed Callback URLs**: Add `https://your-app.amplifyapp.com/api/auth/callback`
- **Allowed Logout URLs**: Add `https://your-app.amplifyapp.com`
- **Allowed Web Origins**: Add `https://your-app.amplifyapp.com`

### Step 9: Redeploy

```bash
git add .
git commit -m "Update Auth0 configuration"
git push origin main
```

## 📊 Verify Deployment

1. Open your Amplify app URL
2. Click "Get Started" or "Sign In"
3. You should be redirected to Auth0 login
4. After login, you should see the dashboard

## 🐛 Troubleshooting

### Auth0 Login Fails

**Error**: "Callback URL mismatch"
- Check Auth0 Allowed Callback URLs include your Amplify domain

**Error**: "Invalid state"
- Regenerate `AUTH0_SECRET` with `openssl rand -hex 32`
- Update environment variable in Amplify

### Build Fails

**Error**: "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

**Error**: "Environment variable not set"
- Verify all env vars are added in Amplify Console
- Redeploy the app

### Page Not Found After Deployment

- Ensure `amplify.yml` is in root directory
- Check Next.js version compatibility
- Review Amplify build logs

## 📝 Development Workflow

### Making Changes

```bash
# 1. Make your changes
# 2. Test locally
npm run dev

# 3. Commit and push
git add .
git commit -m "Your commit message"
git push origin main

# 4. Amplify auto-deploys on push
```

### Viewing Logs

```bash
# Get deployment status
aws amplify list-jobs \
  --app-id $APP_ID \
  --branch-name main \
  --region us-east-1
```

## 🎯 Next Steps

1. ✅ Configure additional OAuth providers (Google, Slack, etc.)
2. ✅ Set up Token Vault for service credentials
3. ✅ Add real AI agent logic (OpenAI integration)
4. ✅ Connect to database (DynamoDB or PostgreSQL)
5. ✅ Add real-time updates (WebSockets)
6. ✅ Implement agent scheduling (AWS Lambda)

## 📚 Resources

- [Auth0 for AI Docs](https://auth0.com/ai/docs/intro/overview)
- [AWS Amplify Hosting](https://docs.amplify.aws/guides/hosting/)
- [CodeCommit User Guide](https://docs.aws.amazon.com/codecommit/latest/userguide/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 🆘 Support

For issues with:
- **Auth0**: Check [Auth0 Community](https://community.auth0.com)
- **AWS Amplify**: Check [AWS Forums](https://forums.aws.amazon.com/forum.jspa?forumID=314)
- **This Project**: Create an issue in the repository

---

**Ready to deploy? Follow the steps above!** 🚀
