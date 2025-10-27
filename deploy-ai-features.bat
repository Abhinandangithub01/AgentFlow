@echo off
git add -A
git commit -m "ADD AI FEATURES: Remove Connected Services, add AI Recommendations sidebar, AI-powered email categorization, smart suggestions, and action buttons"
git push origin main
del /F /Q "%~f0" 2>nul
