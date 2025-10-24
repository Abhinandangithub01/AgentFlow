git add .
git commit -m "Force rebuild - fix React hydration error"
git push origin main
Remove-Item "force-rebuild.ps1" -Force -ErrorAction SilentlyContinue
