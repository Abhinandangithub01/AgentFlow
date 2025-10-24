git add .
git commit -m "Trigger rebuild with hydration fix"
git push origin main
Remove-Item "trigger-rebuild.ps1" -Force -ErrorAction SilentlyContinue
