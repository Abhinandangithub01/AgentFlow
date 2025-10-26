@echo off
git add -A
git commit -m "COMPLETE FIX: Real activity feed, calculated stats, working pause/resume, active agents by default - ALL ISSUES RESOLVED!"
git push origin main
del /F /Q "%~f0" 2>nul
