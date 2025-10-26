git add .
git commit --amend -m "Add Groq migration documentation"
git push origin main --force
Remove-Item "push-fix.ps1" -Force -ErrorAction SilentlyContinue
