git reset --soft HEAD~1
git add .
git commit -m "Add Amplify-only setup guide"
git push origin main
Remove-Item "push-amplify-guide.ps1" -Force -ErrorAction SilentlyContinue
Remove-Item "final-push.ps1" -Force -ErrorAction SilentlyContinue
