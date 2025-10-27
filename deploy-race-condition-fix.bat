@echo off
git add -A
git commit -m "FIX REACT ERROR: Prevent race conditions in activity fetching, wait for agent before loading activities, add cleanup handlers"
git push origin main
del /F /Q "%~f0" 2>nul
