@echo off
git add -A
git commit -m "COMPLETE PERSISTENCE FIX: File storage fallback, DynamoDB with automatic fallback, setup scripts, comprehensive logging - agents now persist!"
git push origin main
del /F /Q "%~f0" 2>nul
