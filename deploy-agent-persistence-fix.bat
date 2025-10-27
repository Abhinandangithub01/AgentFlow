@echo off
git add -A
git commit -m "FIX AGENT PERSISTENCE: Use agentManager.saveAgent in PATCH endpoint, add comprehensive logging, make saveAgent public"
git push origin main
del /F /Q "%~f0" 2>nul
