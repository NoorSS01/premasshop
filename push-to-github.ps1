# PowerShell script to push Prema's Shop to GitHub
# Run this script AFTER installing Git

Write-Host "🚀 Pushing Prema's Shop to GitHub..." -ForegroundColor Cyan

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "frontend" -PathType Container)) {
    Write-Host "❌ Error: frontend folder not found. Make sure you're in the project root." -ForegroundColor Red
    exit 1
}

# Initialize git if not already initialized
if (-not (Test-Path ".git" -PathType Container)) {
    Write-Host "📦 Initializing git repository..." -ForegroundColor Yellow
    git init
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}

# Add remote (remove if exists first)
Write-Host "🔗 Setting up remote repository..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/NoorSS01/premasshop.git

# Add all files
Write-Host "📝 Adding files..." -ForegroundColor Yellow
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    git commit -m "Initial commit: Prema's Shop e-commerce platform"
    
    # Set branch to main
    git branch -M main
    
    Write-Host "☁️  Pushing to GitHub..." -ForegroundColor Yellow
    Write-Host "⚠️  You may be prompted for GitHub credentials." -ForegroundColor Yellow
    Write-Host "   Use your GitHub username and a Personal Access Token as password." -ForegroundColor Yellow
    Write-Host ""
    
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "🌐 Repository: https://github.com/NoorSS01/premasshop" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Push failed. Check your credentials and try again." -ForegroundColor Red
        Write-Host "💡 Tip: Use a Personal Access Token instead of password:" -ForegroundColor Yellow
        Write-Host "   GitHub → Settings → Developer settings → Personal access tokens" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️  No changes to commit. Everything is up to date." -ForegroundColor Blue
}

Write-Host ""
Write-Host "Done! 🎉" -ForegroundColor Green

