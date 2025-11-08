# Quick Start Guide

## For Your Current Device (Having Issues)

Since you're having issues running the website on this device, follow these steps to push to GitHub and run it on another device:

## Step 1: Install Git

1. Download Git: https://git-scm.com/download/win
2. Install with default settings
3. **Restart PowerShell** after installation

## Step 2: Push to GitHub

### Option A: Use the Script (Easiest)

```powershell
# Make sure you're in the project root
cd C:\Users\mdkai\OneDrive\Documents\premasshop

# Run the push script
.\push-to-github.ps1
```

### Option B: Manual Commands

```powershell
# Initialize git
git init

# Add remote
git remote add origin https://github.com/NoorSS01/premasshop.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: Prema's Shop e-commerce platform"

# Push
git branch -M main
git push -u origin main
```

**Note**: When prompted for credentials:
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your GitHub password)
  - Get token from: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Generate with `repo` permissions

## Step 3: On Your Other Device

### Clone the Repository

```powershell
git clone https://github.com/NoorSS01/premasshop.git
cd premasshop
```

### Install Dependencies

```powershell
# Install frontend dependencies
cd frontend
npm install
```

### Set Up Environment

1. Create `frontend/.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

2. Replace logo:
   - Add your logo as `frontend/public/logo.png`

### Run Development Server

```powershell
npm run dev
```

The website will be available at http://localhost:3000

## What Gets Pushed to GitHub

✅ **Will be pushed:**
- All source code
- Configuration files
- Documentation
- Migration SQL files
- Edge Functions code

❌ **Won't be pushed** (protected by .gitignore):
- `.env` files (secrets)
- `node_modules/` (dependencies)
- `dist/` (build output)
- Log files

## Next Steps After Cloning

1. Set up Supabase (see `README.md`)
2. Run database migrations
3. Configure environment variables
4. Deploy Edge Functions
5. Set up PayU (optional, for payments)

See `README.md` and `DEPLOYMENT_CHECKLIST.md` for detailed setup instructions.

