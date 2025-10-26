git add .
git commit -m "Fix Build Errors: TypeScript fixes, lazy OpenAI initialization, dynamic route config"
git push origin main
Remove-Item "push-build-fixes.ps1" -Force -ErrorAction SilentlyContinue
