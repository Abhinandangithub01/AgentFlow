git add .
git commit -m "Migrate from OpenAI to Groq: Use Llama 3.3 70B Versatile, keyword-based RAG"
git push origin main
Remove-Item "push-groq-migration.ps1" -Force -ErrorAction SilentlyContinue
