# Final clean push
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue
git init
git config user.email "mail2abhinandan19@gmail.com"
git config user.name "Abhinandan"
git add .
git commit -m "AgentFlow AI Platform"
git branch -M main
git remote add origin https://github.com/Abhinandangithub01/AgentFlow.git
git push -u origin main --force
