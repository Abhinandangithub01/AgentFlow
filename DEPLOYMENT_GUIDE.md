# 🚀 Complete Deployment Guide

## Prerequisites

- AWS Account with appropriate permissions
- Auth0 Account
- OpenAI API Key
- Node.js 18+ installed
- AWS CLI configured
- Git installed

---

## Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages:
- AWS SDK (S3, DynamoDB, Lambda)
- React Grid Layout
- OpenAI SDK
- LangChain
- Framer Motion
- And more...

---

## Step 2: Set Up AWS Resources

### 2.1 Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://agentflow-documents --region us-east-1

# Block public access
aws s3api put-public-access-block \
  --bucket agentflow-documents \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket agentflow-documents \
  --versioning-configuration Status=Enabled

# Add lifecycle policy (optional - delete old files after 90 days)
cat > lifecycle.json <<EOF
{
  "Rules": [
    {
      "Id": "DeleteOldFiles",
      "Status": "Enabled",
      "Prefix": "",
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket agentflow-documents \
  --lifecycle-configuration file://lifecycle.json
```

### 2.2 Create DynamoDB Tables

```bash
# Agents Table
aws dynamodb create-table \
  --table-name AgentFlow-Agents \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    "IndexName=GSI1,KeySchema=[{AttributeName=GSI1PK,KeyType=HASH},{AttributeName=GSI1SK,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Executions Table
aws dynamodb create-table \
  --table-name AgentFlow-Executions \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Memory Table
aws dynamodb create-table \
  --table-name AgentFlow-Memory \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Knowledge Bases Table
aws dynamodb create-table \
  --table-name AgentFlow-KnowledgeBases \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Vectors Table
aws dynamodb create-table \
  --table-name AgentFlow-Vectors \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Rules Table
aws dynamodb create-table \
  --table-name AgentFlow-Rules \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Connections Table
aws dynamodb create-table \
  --table-name AgentFlow-Connections \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 2.3 Create IAM Role for Lambda

```bash
# Create trust policy
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name agentflow-lambda-execution-role \
  --assume-role-policy-document file://trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name agentflow-lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
  --role-name agentflow-lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

aws iam attach-role-policy \
  --role-name agentflow-lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
```

### 2.4 Deploy Lambda Function

```bash
# Make script executable
chmod +x scripts/deploy-lambda.sh

# Update ROLE_ARN in the script with your account ID
# Then run:
./scripts/deploy-lambda.sh
```

---

## Step 3: Configure Environment Variables

### 3.1 Create .env.local

```bash
# Auth0
AUTH0_SECRET=your-32-character-secret-here
AUTH0_BASE_URL=https://your-app.amplifyapp.com
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=agentflow-documents
AWS_LAMBDA_FUNCTION=agentflow-document-processor

# DynamoDB Tables
DYNAMODB_AGENTS_TABLE=AgentFlow-Agents
DYNAMODB_EXECUTIONS_TABLE=AgentFlow-Executions
DYNAMODB_MEMORY_TABLE=AgentFlow-Memory
DYNAMODB_KNOWLEDGE_BASES_TABLE=AgentFlow-KnowledgeBases
DYNAMODB_VECTORS_TABLE=AgentFlow-Vectors
DYNAMODB_RULES_TABLE=AgentFlow-Rules
DYNAMODB_TOOLS_TABLE=AgentFlow-Tools
DYNAMODB_CONNECTIONS_TABLE=AgentFlow-Connections
DYNAMODB_ANALYTICS_TABLE=AgentFlow-Analytics

# AI Models
OPENAI_API_KEY=sk-proj-your-key
GROQ_API_KEY=gsk_your-key

# Google OAuth (for Gmail)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
GOOGLE_REDIRECT_URI=https://your-app.amplifyapp.com/api/auth/gmail/callback
```

### 3.2 Add to AWS Amplify Console

1. Go to AWS Amplify Console
2. Select your app
3. Go to **App settings** → **Environment variables**
4. Click **Manage variables**
5. Add all variables from `.env.local`

---

## Step 4: Deploy to Amplify

### 4.1 Connect GitHub Repository

1. Go to AWS Amplify Console
2. Click **New app** → **Host web app**
3. Select **GitHub**
4. Authorize and select your repository
5. Select the `main` branch

### 4.2 Configure Build Settings

Amplify should auto-detect Next.js. Verify the build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### 4.3 Deploy

1. Click **Save and deploy**
2. Wait for build to complete (5-10 minutes)
3. Your app will be available at `https://[app-id].amplifyapp.com`

---

## Step 5: Configure Auth0

### 5.1 Create Application

1. Go to Auth0 Dashboard
2. Applications → Create Application
3. Select **Regular Web Application**
4. Note the **Client ID** and **Client Secret**

### 5.2 Configure Callback URLs

Add these URLs in Auth0 Application Settings:

**Allowed Callback URLs:**
```
https://your-app.amplifyapp.com/api/auth/callback
http://localhost:3000/api/auth/callback
```

**Allowed Logout URLs:**
```
https://your-app.amplifyapp.com
http://localhost:3000
```

**Allowed Web Origins:**
```
https://your-app.amplifyapp.com
http://localhost:3000
```

---

## Step 6: Configure Google OAuth (for Gmail)

### 6.1 Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Gmail API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**

### 6.2 Configure Authorized Redirect URIs

Add:
```
https://your-app.amplifyapp.com/api/auth/gmail/callback
http://localhost:3000/api/auth/gmail/callback
```

### 6.3 Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Select **External**
3. Fill in app information
4. Add scopes:
   - `gmail.readonly`
   - `gmail.send`
   - `gmail.modify`
   - `gmail.labels`

---

## Step 7: Test the Application

### 7.1 Local Testing

```bash
npm run dev
```

Visit `http://localhost:3000`

### 7.2 Production Testing

Visit your Amplify URL: `https://[app-id].amplifyapp.com`

### 7.3 Test Checklist

- [ ] User can sign up/login with Auth0
- [ ] User can create an agent
- [ ] User can upload documents to knowledge base
- [ ] User can chat with agent
- [ ] User can customize dashboard with widgets
- [ ] User can connect Gmail
- [ ] Documents are processed by Lambda
- [ ] Chat retrieves context from RAG

---

## Step 8: Monitoring & Maintenance

### 8.1 CloudWatch Logs

Monitor Lambda function:
```bash
aws logs tail /aws/lambda/agentflow-document-processor --follow
```

### 8.2 DynamoDB Metrics

Check table metrics in AWS Console:
- Read/Write capacity
- Item count
- Storage size

### 8.3 S3 Storage

Monitor bucket size:
```bash
aws s3 ls s3://agentflow-documents --recursive --human-readable --summarize
```

---

## Troubleshooting

### Issue: Lambda not triggering

**Solution:**
1. Check S3 bucket notification configuration
2. Verify Lambda has permission to be invoked by S3
3. Check CloudWatch logs for errors

### Issue: DynamoDB throttling

**Solution:**
1. Switch to on-demand billing mode
2. Or increase provisioned capacity

### Issue: Environment variables not loading

**Solution:**
1. Verify all variables are in Amplify Console
2. Trigger a new build
3. Check `next.config.mjs` has all variables listed

### Issue: Auth0 callback error

**Solution:**
1. Verify callback URLs match exactly
2. Check AUTH0_BASE_URL is correct
3. Ensure AUTH0_SECRET is 32+ characters

---

## Cost Estimation

### Monthly Costs (Estimated)

- **AWS Amplify**: $0 (free tier) - $15
- **DynamoDB**: $0 (free tier) - $25
- **S3**: $0 (free tier) - $5
- **Lambda**: $0 (free tier) - $10
- **Auth0**: $0 (free tier for 7,000 users)
- **OpenAI**: Variable based on usage

**Total**: ~$0-55/month for moderate usage

---

## Security Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Rotate secrets regularly** - Every 90 days
3. **Use IAM roles** - Principle of least privilege
4. **Enable MFA** - On AWS and Auth0 accounts
5. **Monitor logs** - Set up CloudWatch alarms
6. **Encrypt data** - Enable encryption at rest for DynamoDB
7. **Use HTTPS only** - Enforce in Amplify settings

---

## Backup & Recovery

### Backup DynamoDB

```bash
# Enable point-in-time recovery
aws dynamodb update-continuous-backups \
  --table-name AgentFlow-Agents \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

### Backup S3

```bash
# Enable versioning (already done)
# Set up cross-region replication (optional)
```

---

## Scaling

The platform is designed to scale automatically:

- **DynamoDB**: On-demand billing scales automatically
- **S3**: Unlimited storage
- **Lambda**: Auto-scales to 1000 concurrent executions
- **Amplify**: Auto-scales with traffic

For high traffic:
1. Consider CloudFront CDN
2. Use DynamoDB DAX for caching
3. Implement API rate limiting

---

## 🎉 Deployment Complete!

Your AI Agent Platform is now live and ready to use!

**Next Steps:**
1. Create your first agent
2. Upload documents to knowledge base
3. Connect Gmail or Slack
4. Customize your dashboard
5. Start chatting with your AI agent!

**Support:**
- Check logs in CloudWatch
- Monitor costs in AWS Billing
- Review Auth0 logs for auth issues

---

**Congratulations! Your platform is production-ready!** 🚀
