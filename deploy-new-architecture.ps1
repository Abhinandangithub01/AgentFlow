git add .
git commit -m "NEW ARCHITECTURE: Separate callback page, sessionStorage, fix React #310"
git push origin main
Remove-Item "deploy-new-architecture.ps1" -Force -ErrorAction SilentlyContinue
