@echo off
git add -A
git commit -m "REAL GMAIL INTEGRATION: Fetch actual emails from Gmail API - no more mock data!"
git push origin main
del /F /Q "%~f0" 2>nul
