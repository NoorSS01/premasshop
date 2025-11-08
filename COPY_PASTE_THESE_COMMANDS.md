# Copy-Paste These Commands to Push to GitHub

## IMPORTANT: You Need Git Installed First!

Since Git is not available, you have two options:

### Option 1: Install Git First (Recommended)

**Download Git:**
- Go to: https://git-scm.com/download/win
- Download and install (use default settings)
- **RESTART PowerShell** after installation

**Then come back and run the commands below.**

---

### Option 2: Use GitHub Desktop (Easier, No Terminal Needed!)

1. Download: https://desktop.github.com/
2. Install and sign in with your GitHub account
3. Click "File" → "Add Local Repository"
4. Select folder: `C:\Users\mdkai\OneDrive\Documents\premasshop`
5. Click "Publish repository" button
6. Done! ✅

---

## If Git is Installed, Run These Commands:

**Copy and paste these ONE BY ONE in PowerShell:**

```powershell
# 1. Navigate to project (if not already there)
cd C:\Users\mdkai\OneDrive\Documents\premasshop

# 2. Initialize git
git init

# 3. Add remote repository
git remote add origin https://github.com/NoorSS01/premasshop.git

# 4. Add all files
git add .

# 5. Commit
git commit -m "Initial commit: Prema's Shop e-commerce platform"

# 6. Set branch to main
git branch -M main

# 7. Push to GitHub (you'll be asked for username and password)
git push -u origin main
```

**When asked for credentials:**
- Username: `NoorSS01`
- Password: Use a **Personal Access Token** (get from https://github.com/settings/tokens)

---

## Quick Install Git Command:

If you have winget, run this first:
```powershell
winget install Git.Git
```

Then **RESTART PowerShell** and run the commands above.

---

## What These Commands Do:

1. `git init` - Creates a git repository in your folder
2. `git remote add origin` - Links to your GitHub repo
3. `git add .` - Adds all files (except .env and node_modules)
4. `git commit` - Saves the changes
5. `git branch -M main` - Names the branch "main"
6. `git push` - Uploads everything to GitHub

---

## After Pushing:

Your code will be on GitHub at: https://github.com/NoorSS01/premasshop

You can then clone it on any other device with:
```powershell
git clone https://github.com/NoorSS01/premasshop.git
```


