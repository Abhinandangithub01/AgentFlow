@echo off
git add -A
git commit -m "DEBUG ACTIVITY FEED: Add comprehensive logging to identify why Gmail emails aren't showing"
git push origin main
del /F /Q "%~f0" 2>nul
