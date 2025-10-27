@echo off
git add -A
git commit -m "ADD DIAGNOSTIC LOGGING: Comprehensive logs for agent save/retrieve to diagnose persistence issues"
git push origin main
del /F /Q "%~f0" 2>nul
