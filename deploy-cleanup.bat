@echo off
git add -A
git commit -m "CLEANUP: Remove temporary documentation - keep only essential files"
git push origin main
del /F /Q "%~f0" 2>nul
