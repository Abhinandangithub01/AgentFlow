# 🚀 Quick Start Guide - Agent Platform

Get your Agent Platform running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Git installed
- Auth0 account (free tier works)
- OpenAI API key (optional for full functionality)

## Step 1: Install Dependencies

```bash
cd C:\Users\mail2\CascadeProjects\agent-platform
npm install
```

## Step 2: Set Up Auth0

### Create Your Auth0 Application

1. Go to https://auth0.com and sign in (or create free account)
2. Go to **Applications** → **Create Application**
3. Name: "Agent Platform"
4. Type: **Regular Web Application**
5. Click **Create**

### Configure Settings

In your new application's settings:

**Allowed Callback URLs:**
```
http://localhost:3000/api/auth/callback
```

**Allowed Logout URLs:**
```
http://localhost:3000
```

**Allowed Web Origins:**
```
http://localhost:3000
```

Click **Save Changes**

### Get Your Credentials

Copy these values (you'll need them next):
- **Domain** (e.g., `dev-xyz123.us.auth0.com`)
- **Client ID**
- **Client Secret**

## Step 3: Configure Environment Variables

Create `.env.local` file:

```bash
copy .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Generate this secret (run in PowerShell):
# -join ((48..57) + (97..122) | Get-Random -Count 32 | % {[char]$_})
AUTH0_SECRET=your-64-character-random-string-here

AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://dev-xyz123.us.auth0.com
AUTH0_CLIENT_ID=your-client-id-here
AUTH0_CLIENT_SECRET=your-client-secret-here

# Optional: for AI features
OPENAI_API_KEY=sk-your-key-here
```

**Generate AUTH0_SECRET** (PowerShell):
```powershell
-join ((48..57) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

## Step 4: Run the Application

```bash
npm run dev
```

Open http://localhost:3000

🎉 **That's it!** You should see the Agent Platform landing page.

## Step 5: Try It Out

1. Click **"Get Started"** or **"Sign In"**
2. You'll be redirected to Auth0 login
3. Sign up for a new account or use:
   - Google
   - GitHub
   - Email/Password
4. After login, you'll see your dashboard!

## What You Can Do Now

✅ **View Dashboard** - See sample agents and stats  
✅ **Create New Agent** - Click "Create Agent" button  
✅ **View Agent Details** - Click on any agent card  
✅ **See Activity Feeds** - Real-time agent activity  

## Sample Agents Available

The platform comes with 3 demo agents:

1. **Email Assistant** - Manages inbox, drafts replies
2. **Invoice Tracker** - Tracks payments, sends reminders
3. **Research Agent** - Monitors news and trends

## Next Steps

### Enable Auth0 for AI Agents

For production use with real integrations:

1. Go to https://auth0.com/ai/docs/get-started
2. Follow the guide to enable AI Agents in your tenant
3. Configure Token Vault for service connections

### Connect Real Services

To connect actual services (Gmail, Slack, etc.):

1. Configure OAuth apps in each service
2. Add them to Auth0 as social connections
3. Enable in Token Vault

### Deploy to Production

When ready to deploy:

```bash
# Run the deployment script
cd scripts
.\deploy-amplify.ps1
```

See [SETUP.md](SETUP.md) for detailed deployment instructions.

## Troubleshooting

### "Cannot GET /api/auth/login"

**Solution:** Make sure `.env.local` exists with Auth0 credentials

### Auth0 Login Redirects to Error Page

**Solution:** Check that Callback URLs in Auth0 match exactly:
```
http://localhost:3000/api/auth/callback
```

### "Module not found" errors

**Solution:** Run `npm install` again

### Port 3000 Already in Use

**Solution:** Change port:
```bash
npm run dev -- -p 3001
```
Then update AUTH0_BASE_URL to `http://localhost:3001`

## Project Structure

```
agent-platform/
├── app/                    # Next.js 14 App Router
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Dashboard page
│   ├── agent/[id]/        # Agent details
│   ├── create-agent/      # Agent creation wizard
│   └── api/               # API routes
│       ├── auth/          # Auth0 endpoints
│       └── agents/        # Agent management
├── components/            # Reusable UI components
├── lib/                   # Utility functions
├── public/               # Static assets
└── scripts/              # Deployment scripts
```

## Tips

💡 **Demo Mode:** The app works without OpenAI API key - it shows sample data  
💡 **Dark Mode:** Coming soon!  
💡 **Mobile:** Responsive design works on all devices  
💡 **Fast Refresh:** Code changes update instantly during development  

## Support

- **Auth0 Issues:** https://community.auth0.com
- **Next.js Help:** https://nextjs.org/docs
- **Project Docs:** See [README.md](README.md) and [SETUP.md](SETUP.md)

## What's Next?

After exploring locally:

1. ✅ Review the code to understand the architecture
2. ✅ Customize the UI colors/branding (see `tailwind.config.ts`)
3. ✅ Add your own agent templates
4. ✅ Deploy to AWS Amplify (see SETUP.md)
5. ✅ Submit to Auth0 AI Challenge!

---

**Built with ❤️ for Auth0 AI Challenge 2025**

🏆 **Good luck with your submission!**
