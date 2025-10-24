# Deploy Agent Platform to AWS Amplify
# PowerShell script for Windows

Write-Host "🚀 Agent Platform - AWS Amplify Deployment Script" -ForegroundColor Cyan
Write-Host ""

# Check if AWS CLI is installed
$awsInstalled = Get-Command aws -ErrorAction SilentlyContinue
if (-not $awsInstalled) {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    Write-Host "Download from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ AWS CLI found" -ForegroundColor Green

# Check if Git is installed
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitInstalled) {
    Write-Host "❌ Git is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Git found" -ForegroundColor Green
Write-Host ""

# Configuration
$REGION = "us-east-1"
$REPO_NAME = "agent-platform"
$APP_NAME = "agent-platform"

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Region: $REGION"
Write-Host "   Repository: $REPO_NAME"
Write-Host "   App Name: $APP_NAME"
Write-Host ""

# Step 1: Initialize Git if not already initialized
Write-Host "Step 1: Initializing Git repository..." -ForegroundColor Cyan
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✓ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "✓ Git repository already exists" -ForegroundColor Green
}

# Add .gitignore if not exists
if (-not (Test-Path ".gitignore")) {
    Copy-Item ".gitignore.example" ".gitignore" -ErrorAction SilentlyContinue
}

# Step 2: Create CodeCommit repository
Write-Host ""
Write-Host "Step 2: Creating CodeCommit repository..." -ForegroundColor Cyan

$repoExists = aws codecommit get-repository --repository-name $REPO_NAME --region $REGION 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating new repository..." -ForegroundColor Yellow
    aws codecommit create-repository `
        --repository-name $REPO_NAME `
        --repository-description "Agent Platform - Autonomous AI Agents with Auth0" `
        --region $REGION
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Repository created successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create repository" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ Repository already exists" -ForegroundColor Green
}

# Step 3: Configure Git credentials
Write-Host ""
Write-Host "Step 3: Configuring Git credentials..." -ForegroundColor Cyan
git config --global credential.helper "!aws codecommit credential-helper `$@"
git config --global credential.UseHttpPath true
Write-Host "✓ Git credentials configured" -ForegroundColor Green

# Step 4: Add remote and commit
Write-Host ""
Write-Host "Step 4: Committing code..." -ForegroundColor Cyan

$remoteExists = git remote | Select-String -Pattern "origin"
if (-not $remoteExists) {
    $repoUrl = "https://git-codecommit.$REGION.amazonaws.com/v1/repos/$REPO_NAME"
    git remote add origin $repoUrl
    Write-Host "✓ Remote added: $repoUrl" -ForegroundColor Green
} else {
    Write-Host "✓ Remote already configured" -ForegroundColor Green
}

git add .
git commit -m "Initial commit: Agent Platform with Auth0 integration" -ErrorAction SilentlyContinue
Write-Host "✓ Code committed" -ForegroundColor Green

# Step 5: Push to CodeCommit
Write-Host ""
Write-Host "Step 5: Pushing to CodeCommit..." -ForegroundColor Cyan
git branch -M main
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Code pushed successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️ Push may have failed - check your AWS credentials" -ForegroundColor Yellow
}

# Step 6: Create Amplify App
Write-Host ""
Write-Host "Step 6: Creating Amplify app..." -ForegroundColor Cyan

$appExists = aws amplify list-apps --region $REGION | ConvertFrom-Json | Select-Object -ExpandProperty apps | Where-Object { $_.name -eq $APP_NAME }

if (-not $appExists) {
    Write-Host "Creating new Amplify app..." -ForegroundColor Yellow
    
    $createResult = aws amplify create-app `
        --name $APP_NAME `
        --repository "https://git-codecommit.$REGION.amazonaws.com/v1/repos/$REPO_NAME" `
        --platform WEB `
        --region $REGION | ConvertFrom-Json
    
    $APP_ID = $createResult.app.appId
    Write-Host "✓ Amplify app created: $APP_ID" -ForegroundColor Green
} else {
    $APP_ID = $appExists.appId
    Write-Host "✓ Amplify app already exists: $APP_ID" -ForegroundColor Green
}

# Step 7: Create branch
Write-Host ""
Write-Host "Step 7: Creating Amplify branch..." -ForegroundColor Cyan

$branchExists = aws amplify list-branches --app-id $APP_ID --region $REGION 2>&1 | ConvertFrom-Json | Select-Object -ExpandProperty branches | Where-Object { $_.branchName -eq "main" }

if (-not $branchExists) {
    aws amplify create-branch `
        --app-id $APP_ID `
        --branch-name main `
        --region $REGION
    
    Write-Host "✓ Branch created" -ForegroundColor Green
} else {
    Write-Host "✓ Branch already exists" -ForegroundColor Green
}

# Step 8: Start deployment
Write-Host ""
Write-Host "Step 8: Starting deployment..." -ForegroundColor Cyan

aws amplify start-job `
    --app-id $APP_ID `
    --branch-name main `
    --job-type RELEASE `
    --region $REGION

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Deployment started" -ForegroundColor Green
} else {
    Write-Host "⚠️ Could not start deployment" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✓ Deployment Initiated!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "App ID: $APP_ID" -ForegroundColor White
Write-Host "Region: $REGION" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Add environment variables in Amplify Console"
Write-Host "2. Visit: https://console.aws.amazon.com/amplify/home?region=$REGION#/$APP_ID"
Write-Host "3. Go to App Settings > Environment Variables"
Write-Host "4. Add your Auth0 credentials (see .env.local.example)"
Write-Host ""
Write-Host "Your app will be available at:" -ForegroundColor Green
Write-Host "https://main.$APP_ID.amplifyapp.com" -ForegroundColor Cyan
Write-Host ""
