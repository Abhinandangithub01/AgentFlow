git add .
git commit -m "Add better error handling to show actual Gmail OAuth error"
git push origin main
Remove-Item "push-error-handling.ps1" -Force -ErrorAction SilentlyContinue
