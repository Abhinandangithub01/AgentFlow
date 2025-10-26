# 🗑️ Amplify Cache Clear Instructions

## Problem: React Error #310 Still Showing

If you're still seeing React error #310 on Amplify, it's because **Amplify is serving cached JavaScript files**.

---

## ✅ Automatic Fix (Just Deployed)

I just pushed code that will force a fresh build:
- ✅ Bumped version to 1.0.1
- ✅ Added unique build ID generation
- ✅ Added cache-bust file

**Wait 10 minutes for Amplify to deploy this, then test again.**

---

## 🔧 Manual Cache Clear (If Still Not Working)

If the error persists after 10 minutes, manually clear the cache:

### **Option 1: Redeploy in Amplify Console**

1. Go to **AWS Amplify Console**
2. Click on **AgentFlow** app
3. Go to **main** branch
4. Click the **"Redeploy this version"** button
5. Wait 5-10 minutes for deployment
6. **Clear your browser cache**:
   - Press `Ctrl + Shift + Delete`
   - Select "All time"
   - Check "Cached images and files"
   - Click "Clear data"
7. Visit your app again

### **Option 2: Invalidate CloudFront Cache**

If Amplify uses CloudFront:

1. Go to **AWS CloudFront Console**
2. Find the distribution for your Amplify app
3. Go to **"Invalidations"** tab
4. Click **"Create invalidation"**
5. Enter paths to invalidate:
   ```
   /*
   /_next/*
   ```
6. Click **"Create invalidation"**
7. Wait 5 minutes
8. Clear browser cache
9. Test again

### **Option 3: Disable Amplify Cache Temporarily**

1. Go to **AWS Amplify Console**
2. Click on **AgentFlow** app
3. Go to **"Hosting" → "Build settings"**
4. Click **"Edit"**
5. Add this to your `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths: []  # ← Disable cache temporarily
```

6. Click **"Save"**
7. Trigger a new build
8. After it works, you can re-enable cache

---

## 🧪 Verify Fix is Working

After clearing cache and redeploying:

1. Visit: `https://main.d13aenlm5qrdln.amplifyapp.com`
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. You should **NOT** see React error #310
5. You should see the page load correctly
6. Gmail connection should work without errors

---

## 📊 Why This Happens

**Root Cause**: 
- Next.js generates hashed JavaScript files (e.g., `117-783b92b9d42555a3.js`)
- Amplify/CloudFront caches these files
- When you deploy new code, old cached files are still served
- Browser loads old JavaScript with the bug

**Solution**:
- Generate unique build IDs for each deployment
- Clear Amplify and CloudFront caches
- Clear browser cache
- Redeploy

---

## ✅ Long-term Prevention

The code I just deployed includes:

```javascript
// next.config.mjs
generateBuildId: async () => {
  return `build-${Date.now()}`;
}
```

This ensures **every deployment gets a unique build ID**, forcing browsers and CDNs to fetch fresh files.

**This should prevent cache issues in future deployments!**

---

## 🎯 Summary

**Immediate actions:**
1. ⏳ Wait 10 minutes for current deployment
2. 🧹 Clear browser cache completely
3. 🔄 Hard refresh (Ctrl + F5)
4. 🧪 Test Gmail connection

**If still broken:**
1. Manually redeploy in Amplify Console
2. Clear browser cache again
3. Invalidate CloudFront cache (if applicable)
4. Test again

**After this deployment, cache issues should be resolved permanently!** 🎉
