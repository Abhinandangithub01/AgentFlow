@echo off
git add -A
git commit -m "IMPROVED TOKEN MANAGEMENT: Simplified token manager, better structure, automatic refresh, removed custom vault complexity"
git push origin main
del /F /Q "%~f0" 2>nul
