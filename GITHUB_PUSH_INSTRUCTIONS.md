# Push to GitHub - Simple Instructions

## Step 1: Install Git (if not installed)

Git was just installed via winget. **You need to restart PowerShell** for it to work.

1. **Close this PowerShell window**
2. **Open a new PowerShell window**
3. **Navigate back to the project:**
   ```powershell
   cd C:\Users\mdkai\OneDrive\Documents\premasshop
   ```

## Step 2: Run the Push Script

After restarting PowerShell, run:

```powershell
.\push-to-github-now.ps1
```

## Step 3: When Prompted for Credentials

When Git asks for your GitHub username and password:

- **Username**: Your GitHub username (`NoorSS01`)
- **Password**: Use a **Personal Access Token** (NOT your GitHub password!)

### How to Get Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name like "Prema Shop Push"
4. Select scope: **`repo`** (check the box)
5. Click **"Generate token"**
6. **Copy the token immediately** (you won't see it again!)
7. Use this token as your password when Git prompts you

## Alternative: Manual Push Commands

If the script doesn't work, run these commands one by one:

```powershell
# Make sure you're in the project root
cd C:\Users\mdkai\OneDrive\Documents\premasshop

# Initialize git (if not done)
git init

# Add remote
git remote add origin https://github.com/NoorSS01/premasshop.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: Prema's Shop e-commerce platform"

# Set branch to main
git branch -M main

# Push (you'll be prompted for credentials)
git push -u origin main
```

## What Gets Pushed?

✅ **Will be pushed:**
- All source code
- Configuration files
- Documentation
- Migration SQL files
- Edge Functions code

❌ **Won't be pushed** (protected by .gitignore):
- `.env` files (contains your secrets - good!)
- `node_modules/` (dependencies)
- `dist/` (build output)
- Log files

## After Pushing

Once pushed successfully, you can:

1. **Clone on your other device:**
   ```powershell
   git clone https://github.com/NoorSS01/premasshop.git
   ```

2. **Set up on the other device:**
   - Create `frontend/.env` with your Supabase credentials
   - Run `npm install` in the frontend folder
   - Run `npm run dev` to start the website

## Troubleshooting

### "Git is not recognized"
- Restart PowerShell after installing Git
- Or install Git manually from https://git-scm.com/download/win

### "Authentication failed"
- Make sure you're using a Personal Access Token, not your GitHub password
- Token must have `repo` permissions

### "Repository not found"
- Make sure the repository exists at: https://github.com/NoorSS01/premasshop
- Make sure you have write access to the repository

### "Remote origin already exists"
Run this first:
```powershell
git remote remove origin
git remote add origin https://github.com/NoorSS01/premasshop.git
```

