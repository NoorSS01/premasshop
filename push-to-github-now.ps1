# Script to push Prema's Shop to GitHub
# Run this AFTER restarting PowerShell (if Git was just installed)

Write-Host "🚀 Pushing Prema's Shop to GitHub..." -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    $gitVersion = git --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
    } else {
        throw "Git not found"
    }
} catch {
    Write-Host "❌ Git is not installed or not in PATH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please do one of the following:" -ForegroundColor Yellow
    Write-Host "1. Restart PowerShell (if Git was just installed)" -ForegroundColor White
    Write-Host "2. Or install Git manually from: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "3. Then run this script again" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "frontend" -PathType Container)) {
    Write-Host "❌ Error: frontend folder not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the project root directory." -ForegroundColor Yellow
    exit 1
}

# Initialize git if not already initialized
if (-not (Test-Path ".git" -PathType Container)) {
    Write-Host "📦 Initializing git repository..." -ForegroundColor Yellow
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to initialize git repository!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}

# Configure git user (if not already configured)
Write-Host "🔧 Configuring git (if needed)..." -ForegroundColor Yellow
$gitUser = git config --global user.name 2>$null
$gitEmail = git config --global user.email 2>$null

if (-not $gitUser) {
    Write-Host "⚠️  Git user name not configured" -ForegroundColor Yellow
    $userName = Read-Host "Enter your name (for git commits)"
    if ($userName) {
        git config --global user.name $userName
    }
}

if (-not $gitEmail) {
    Write-Host "⚠️  Git email not configured" -ForegroundColor Yellow
    $userEmail = Read-Host "Enter your email (for git commits)"
    if ($userEmail) {
        git config --global user.email $userEmail
    }
}

# Add remote (remove if exists first)
Write-Host "🔗 Setting up remote repository..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/NoorSS01/premasshop.git

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to add remote repository!" -ForegroundColor Red
    exit 1
}

# Add all files
Write-Host "📝 Adding files to git..." -ForegroundColor Yellow
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    git commit -m "Initial commit: Prema's Shop e-commerce platform"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to commit changes!" -ForegroundColor Red
        exit 1
    }
    
    # Set branch to main
    git branch -M main
    
    Write-Host ""
    Write-Host "☁️  Pushing to GitHub..." -ForegroundColor Yellow
    Write-Host "⚠️  You will be prompted for GitHub credentials." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📌 IMPORTANT: Use a Personal Access Token as password!" -ForegroundColor Cyan
    Write-Host "   Get token from: GitHub → Settings → Developer settings → Personal access tokens" -ForegroundColor White
    Write-Host "   Generate token with 'repo' permissions" -ForegroundColor White
    Write-Host ""
    
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "🌐 Repository: https://github.com/NoorSS01/premasshop" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🎉 Done! You can now clone this repo on your other device." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Push failed!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Common issues:" -ForegroundColor Yellow
        Write-Host "1. Wrong credentials - Use Personal Access Token, not password" -ForegroundColor White
        Write-Host "2. Repository doesn't exist - Make sure https://github.com/NoorSS01/premasshop exists" -ForegroundColor White
        Write-Host "3. No permission - Make sure you have access to the repository" -ForegroundColor White
        Write-Host ""
        Write-Host "Try running: git push -u origin main" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️  No changes to commit. Everything is up to date." -ForegroundColor Blue
    Write-Host "If you want to push anyway, run: git push -u origin main" -ForegroundColor Yellow
}

Write-Host ""

