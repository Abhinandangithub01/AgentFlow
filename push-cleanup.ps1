git add .
git commit -m "Codebase Cleanup: User Flows, Organization Guide, Archive Old Docs, Remove Temp Files"
git push origin main
Remove-Item "push-cleanup.ps1" -Force -ErrorAction SilentlyContinue
