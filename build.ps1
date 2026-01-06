# Build script to prevent EPERM errors on Windows
# This script temporarily overrides HOME and USERPROFILE to prevent Next.js from scanning system directories

$env:HOME = $PWD.Path
$env:USERPROFILE = $PWD.Path

Write-Host "Building Next.js application..." -ForegroundColor Green
npm run build
