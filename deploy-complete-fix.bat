@echo off
git add -A
git commit -m "COMPLETE FIX: Robust Gmail detection, 24hr email fetch, functional AI buttons, all features working end-to-end"
git push origin main
del /F /Q "%~f0" 2>nul
