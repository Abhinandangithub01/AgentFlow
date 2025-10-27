@echo off
git add -A
git commit -m "FIX AGENT CREATION: Add 500ms delay and verification after creation to handle DynamoDB eventual consistency"
git push origin main
del /F /Q "%~f0" 2>nul
