@echo off
git add -A
git commit -m "FIX GMAIL SERVICES: Auto-populate services array when template is selected so Gmail emails are fetched"
git push origin main
del /F /Q "%~f0" 2>nul
