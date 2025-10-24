git add .
git commit -m "Trigger full rebuild to load Google OAuth environment variables"
git push origin main
Remove-Item "trigger-full-rebuild.ps1" -Force -ErrorAction SilentlyContinue
