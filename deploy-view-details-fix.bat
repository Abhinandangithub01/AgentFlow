@echo off
git add -A
git commit -m "FIX VIEW DETAILS: Add retry logic, better error handling, detailed logging for agent fetch failures"
git push origin main
del /F /Q "%~f0" 2>nul
