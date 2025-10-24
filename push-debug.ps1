git add .
git commit -m "Add environment variable debugging and validation"
git push origin main
Remove-Item "push-debug.ps1" -Force -ErrorAction SilentlyContinue
