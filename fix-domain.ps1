# Fix domain typo in all documentation
Get-ChildItem -Path "docs" -Filter "*.md" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'd13senln5grdln', 'd13aenlm5qrdln'
    Set-Content $_.FullName -Value $content -NoNewline
}

Write-Host "Domain fixed in all documentation files"

# Commit and push
git add .
git commit -m "Fix Amplify domain typo in documentation"
git push origin main

# Clean up
Remove-Item "fix-domain.ps1" -Force
