@echo off
git add -A
git commit -m "COMPLETE PERSISTENCE: Agents + Gmail connections now survive reloads - DynamoDB storage for everything!"
git push origin main
del /F /Q "%~f0" 2>nul
