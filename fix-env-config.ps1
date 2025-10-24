git add .
git commit -m "FIX: Add Google OAuth variables to Next.js config - Critical fix for environment variables"
git push origin main
Remove-Item "fix-env-config.ps1" -Force -ErrorAction SilentlyContinue
