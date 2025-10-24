# 🚀 Deployment Guide

## AWS Amplify Deployment

### Prerequisites
- AWS Account
- GitHub repository with code
- Auth0 account configured

### Environment Variables Required

Add these in AWS Amplify Console (App settings → Environment variables):

```env
AUTH0_SECRET=a7b9c3d2e5f8g1h4i6j9k2l5m8n1o4p7q0r3s6t9u2v5w8x1y4z7a0b3c6d9e2f5
AUTH0_BASE_URL=https://your-amplify-domain.amplifyapp.com
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
GROQ_API_KEY=your-groq-api-key-here
```

### Auth0 Configuration

Update these URLs in Auth0 Dashboard (Applications → Your App → Settings):

**Allowed Callback URLs**:
```
http://localhost:3000/api/auth/callback,
https://your-amplify-domain.amplifyapp.com/api/auth/callback
```

**Allowed Logout URLs**:
```
http://localhost:3000,
https://your-amplify-domain.amplifyapp.com
```

**Allowed Web Origins**:
```
http://localhost:3000,
https://your-amplify-domain.amplifyapp.com
```

### Deployment Steps

1. **Connect Repository**:
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect your GitHub repository

2. **Configure Build Settings**:
   - Build command: `npm run build`
   - Output directory: `.next`
   - Use the provided `amplify.yml`

3. **Add Environment Variables**:
   - Go to App settings → Environment variables
   - Add all variables listed above

4. **Deploy**:
   - Click "Save and deploy"
   - Wait for build to complete (~5 minutes)

5. **Update Auth0**:
   - Copy your Amplify domain
   - Update Auth0 URLs with your domain
   - Update `AUTH0_BASE_URL` in Amplify

6. **Redeploy**:
   - Trigger a new deployment
   - Test login functionality

### Troubleshooting

**500 Error on Login**:
- Check all Auth0 environment variables are set
- Verify Auth0 callback URLs match your domain
- Check Amplify build logs for errors

**Build Failures**:
- Check TypeScript errors in build logs
- Verify all dependencies are in `package.json`
- Check Node.js version compatibility

**Auth0 Redirect Issues**:
- Ensure `AUTH0_BASE_URL` matches your Amplify domain exactly
- Check Auth0 allowed URLs include your domain
- Clear browser cache and try again

---

For more details, see:
- [Auth0 Setup](./AUTH0_SETUP.md)
- [Gmail Integration](./GMAIL_INTEGRATION.md)
- [GROQ AI](./GROQ_AI.md)
