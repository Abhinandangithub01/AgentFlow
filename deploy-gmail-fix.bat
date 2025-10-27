@echo off
git add -A
git commit -m "FIX GMAIL CONNECTION: Enhanced logging, check both DynamoDB and Token Vault, fix connection persistence"
git push origin main
del /F /Q "%~f0" 2>nul
