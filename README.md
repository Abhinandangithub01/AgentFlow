# AgentFlow - AI Agent Platform

**AgentFlow** is a modern AI agent platform built with Next.js 14, Auth0, and GROQ AI. Create, manage, and deploy intelligent agents that automate tasks, analyze emails, and integrate with various services.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Visit `http://localhost:3000` and sign in with Auth0.

## ✨ Features

- **Autonomous AI Agents**: Deploy agents that work 24/7 on your behalf
- **Beautiful UI**: Crystal-clear activity feeds and dashboards
- **Secure by Default**: Auth0 Token Vault manages all credentials
- **Real-time Updates**: See exactly what your agents are doing
- **Multi-Agent Support**: Run multiple agents simultaneously
- **Fine-grained Permissions**: Control exactly what agents can do
- **Gmail Integration**: Connect and manage your Gmail account

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: TailwindCSS, Framer Motion
- **Authentication**: Auth0 for AI Agents
- **AI**: OpenAI API
- **Deployment**: AWS Amplify Gen 2
- **Version Control**: AWS CodeCommit

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Auth0 account with AI Agents enabled
- OpenAI API key
- AWS account with Amplify access

### Local Development

1. Clone the repository:
```bash
git clone https://git-codecommit.us-east-1.amazonaws.com/v1/repos/agent-platform
cd agent-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Auth0 Configuration
AUTH0_SECRET='generate-with-openssl-rand-hex-32'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'

# OpenAI API Key
OPENAI_API_KEY='your-openai-api-key'
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 🔐 Auth0 Setup

### 1. Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Create a new Regular Web Application
3. Configure settings:
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`

### 2. Enable Auth0 for AI Agents

Follow the guide at: https://auth0.com/ai/docs/get-started/user-authentication

1. Enable AI Agents in your tenant
2. Configure Token Vault
3. Set up service connections (Gmail, Slack, etc.)

### 3. Configure Environment Variables

Copy your Auth0 credentials to `.env.local`:
- Domain → `AUTH0_ISSUER_BASE_URL`
- Client ID → `AUTH0_CLIENT_ID`
- Client Secret → `AUTH0_CLIENT_SECRET`

Generate a secret for `AUTH0_SECRET`:
```bash
openssl rand -hex 32
```

## 📚 Documentation

- **[Quick Start](./QUICKSTART.md)** - Get up and running in 5 minutes
- **[Setup Guide](./SETUP.md)** - Detailed setup instructions
- **[Deployment](./docs/DEPLOYMENT.md)** - Deploy to AWS Amplify
- **[Auth0 Setup](./docs/AUTH0_SETUP.md)** - Configure authentication
- **[Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)** - Enable Gmail integration
- **[Gmail Integration](./docs/GMAIL_INTEGRATION.md)** - Gmail API usage
- **[GROQ AI](./docs/GROQ_AI.md)** - AI capabilities and usage
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and fixes

## 🚀 Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy to AWS Amplify:**

1. Push code to GitHub
2. Connect repository in Amplify Console
3. Add environment variables
4. Deploy
4. Select "AWS CodeCommit" as source
5. Choose your repository and branch
6. Configure build settings (auto-detected from amplify.yml)
7. Add environment variables in Amplify Console
8. Deploy!

### Option 2: Deploy via AWS CLI

```bash
# Configure AWS CLI
aws configure

# Create Amplify app
aws amplify create-app --name agent-platform --repository codecommit://agent-platform

# Connect branch
aws amplify create-branch --app-id <app-id> --branch-name main
```

## 📁 Project Structure

```
agent-platform/
├── app/
│   ├── api/
│   │   └── auth/          # Auth0 authentication routes
│   ├── dashboard/         # Main dashboard
│   ├── agent/[id]/        # Agent detail view
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
├── lib/
│   └── utils.ts          # Utility functions
├── public/               # Static assets
├── amplify.yml           # AWS Amplify build config
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## 🎯 Features Showcase

### 1. User Authentication (Auth0)
- Secure login/logout
- User profile management
- Session handling

### 2. Token Vault (Auth0 for AI)
- Secure credential storage
- OAuth flow for service connections
- Scoped permissions

### 3. Fine-grained Authorization
- Role-based access control
- Service-specific permissions
- Action limits and quotas

### 4. Beautiful Agent UI
- Real-time activity feeds
- Actionable cards
- Performance metrics
- Service connection status

## 🤖 Sample Agents

The platform includes demo agents:

1. **Email Assistant**: Manages inbox, drafts replies, flags urgent items
2. **Invoice Tracker**: Monitors payments, sends reminders
3. **Research Agent**: Monitors industry news and trends

## 📊 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AUTH0_SECRET` | Session encryption key | ✅ |
| `AUTH0_BASE_URL` | Application URL | ✅ |
| `AUTH0_ISSUER_BASE_URL` | Auth0 tenant URL | ✅ |
| `AUTH0_CLIENT_ID` | Auth0 application ID | ✅ |
| `AUTH0_CLIENT_SECRET` | Auth0 application secret | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | ✅ |

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📝 License

Built for Auth0 AI Challenge 2025

## 🏆 Challenge Submission

This project demonstrates:

✅ **User Authentication**: Secure Auth0 login for dashboard access  
✅ **Tool Control**: Token Vault manages all service credentials  
✅ **Knowledge Limiting**: Fine-grained authorization for data access  
✅ **Autonomous Agents**: AI agents run continuously with secure permissions  
✅ **Beautiful UI**: Transparent, controllable agent experience  

## 🤝 Contributing

This is a challenge submission. For questions or feedback, please contact the project maintainer.

## 📚 Resources

- [Auth0 for AI Agents Docs](https://auth0.com/ai/docs/intro/overview)
- [Next.js Documentation](https://nextjs.org/docs)
- [AWS Amplify Hosting](https://docs.amplify.aws/)
- [TailwindCSS](https://tailwindcss.com/docs)

## 🎨 Screenshots

[Add screenshots of your deployed application here]

---

**Built with ❤️ for Auth0 AI Challenge 2025**
