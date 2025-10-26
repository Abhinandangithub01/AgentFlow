#!/bin/bash

# Deploy Lambda Function for Document Processing

echo "🚀 Deploying AgentFlow Document Processor Lambda..."

# Variables
FUNCTION_NAME="agentflow-document-processor"
REGION="us-east-1"
ROLE_ARN="arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role"
HANDLER="index.handler"
RUNTIME="nodejs18.x"

# Navigate to Lambda directory
cd lambda/document-processor

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create deployment package
echo "📦 Creating deployment package..."
zip -r function.zip . -x "*.git*" "*.DS_Store"

# Check if function exists
FUNCTION_EXISTS=$(aws lambda get-function --function-name $FUNCTION_NAME --region $REGION 2>&1)

if echo "$FUNCTION_EXISTS" | grep -q "ResourceNotFoundException"; then
  # Create new function
  echo "✨ Creating new Lambda function..."
  aws lambda create-function \
    --function-name $FUNCTION_NAME \
    --runtime $RUNTIME \
    --role $ROLE_ARN \
    --handler $HANDLER \
    --zip-file fileb://function.zip \
    --timeout 300 \
    --memory-size 1024 \
    --region $REGION \
    --environment Variables="{
      DYNAMODB_VECTORS_TABLE=AgentFlow-Vectors,
      DYNAMODB_KNOWLEDGE_BASES_TABLE=AgentFlow-KnowledgeBases
    }"
else
  # Update existing function
  echo "🔄 Updating existing Lambda function..."
  aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://function.zip \
    --region $REGION
fi

# Configure S3 trigger
echo "🔗 Configuring S3 trigger..."
S3_BUCKET="agentflow-documents"

# Add permission for S3 to invoke Lambda
aws lambda add-permission \
  --function-name $FUNCTION_NAME \
  --statement-id s3-trigger \
  --action lambda:InvokeFunction \
  --principal s3.amazonaws.com \
  --source-arn arn:aws:s3:::$S3_BUCKET \
  --region $REGION \
  2>/dev/null || echo "Permission already exists"

# Configure S3 bucket notification
cat > notification.json <<EOF
{
  "LambdaFunctionConfigurations": [
    {
      "LambdaFunctionArn": "arn:aws:lambda:$REGION:YOUR_ACCOUNT_ID:function:$FUNCTION_NAME",
      "Events": ["s3:ObjectCreated:*"],
      "Filter": {
        "Key": {
          "FilterRules": [
            {
              "Name": "prefix",
              "Value": "users/"
            }
          ]
        }
      }
    }
  ]
}
EOF

aws s3api put-bucket-notification-configuration \
  --bucket $S3_BUCKET \
  --notification-configuration file://notification.json \
  --region $REGION

# Cleanup
rm function.zip notification.json

echo "✅ Lambda function deployed successfully!"
echo "📝 Function name: $FUNCTION_NAME"
echo "🌍 Region: $REGION"

cd ../..
