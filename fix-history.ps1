git reset --soft HEAD~2
git add .
git commit -m "Clean codebase and organize documentation"
git push origin main --force
Remove-Item "commit-cleanup.ps1" -Force -ErrorAction SilentlyContinue
Remove-Item "push-clean.ps1" -Force -ErrorAction SilentlyContinue
Remove-Item "fix-history.ps1" -Force -ErrorAction SilentlyContinue
