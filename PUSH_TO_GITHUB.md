# How to Push to GitHub

## Step 1: Install Git

### Option 1: Download Git for Windows (Recommended)
1. Visit: https://git-scm.com/download/win
2. Download the installer
3. Run the installer with default settings
4. **Important**: Choose "Git from the command line and also from 3rd-party software" when prompted
5. Restart PowerShell after installation

### Option 2: Using Winget
```powershell
winget install Git.Git
```

### Verify Installation
After installing, close and reopen PowerShell, then run:
```powershell
git --version
```

## Step 2: Configure Git (First Time Only)

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Initialize and Push to GitHub

### 3.1 Initialize Git Repository

```powershell
# Make sure you're in the project root
cd C:\Users\mdkai\OneDrive\Documents\premasshop

# Initialize git repository
git init

# Add remote repository
git remote add origin https://github.com/NoorSS01/premasshop.git
```

### 3.2 Add All Files

```powershell
# Add all files (except those in .gitignore)
git add .
```

### 3.3 Commit Files

```powershell
git commit -m "Initial commit: Prema's Shop e-commerce platform"
```

### 3.4 Push to GitHub

```powershell
# Push to main branch
git branch -M main
git push -u origin main
```

**Note**: You'll be prompted for GitHub credentials. You can use:
- Your GitHub username and a Personal Access Token (recommended)
- Or GitHub Desktop for easier authentication

## Alternative: Using GitHub Desktop

If you prefer a GUI:

1. Download GitHub Desktop: https://desktop.github.com/
2. Sign in with your GitHub account
3. Click "File" → "Add Local Repository"
4. Select the `premasshop` folder
5. Click "Publish repository" to push to GitHub

## Troubleshooting

### If you get "fatal: not a git repository"
Make sure you're in the project root directory and run `git init` first.

### If you get authentication errors
1. Use a Personal Access Token instead of password:
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` permissions
   - Use token as password when prompted

### If you get "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/NoorSS01/premasshop.git
```

## Quick Command Summary

```powershell
# Install Git first, then:
cd C:\Users\mdkai\OneDrive\Documents\premasshop
git init
git remote add origin https://github.com/NoorSS01/premasshop.git
git add .
git commit -m "Initial commit: Prema's Shop e-commerce platform"
git branch -M main
git push -u origin main
```

## Files That Won't Be Pushed (Protected by .gitignore)

- `.env` files (contains secrets)
- `node_modules/` (dependencies)
- `dist/` (build output)
- Log files
- IDE files

All your source code, migrations, and documentation will be pushed!

