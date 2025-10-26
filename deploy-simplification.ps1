git add .
git commit -m "COMPLETE SIMPLIFICATION: Remove ALL sessionStorage from integrations page - show messages on callback page instead"
git push origin main
Remove-Item "deploy-simplification.ps1" -Force -ErrorAction SilentlyContinue
