# How to Run Prema's Shop Locally

## Step 1: Install Node.js

### Quick Install (Using Winget)
```powershell
winget install OpenJS.NodeJS.LTS
```

### Or Manual Install
1. Visit: https://nodejs.org/
2. Download the **LTS** version (recommended)
3. Run the installer
4. ✅ **Important**: Make sure "Add to PATH" is checked
5. Restart PowerShell after installation

### Verify Installation
After installing, close and reopen PowerShell, then run:
```powershell
node --version
npm --version
```

You should see version numbers like:
```
v20.10.0
10.2.3
```

## Step 2: Run the Setup Script

Once Node.js is installed, run:

```powershell
# Make sure you're in the project root
cd C:\Users\mdkai\OneDrive\Documents\premasshop

# Run the setup script
.\setup-and-run.ps1
```

This script will:
- ✅ Check if Node.js is installed
- ✅ Install all dependencies
- ✅ Create .env file if needed
- ✅ Start the development server

## Step 3: Configure Supabase (Required)

The website needs Supabase credentials to work. You have two options:

### Option A: Use Existing Supabase Project
1. Open `frontend/.env` file
2. Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
3. Save the file
4. The dev server will automatically reload

### Option B: Set Up New Supabase Project
1. Go to https://app.supabase.com
2. Create a new project
3. Get your Project URL and Anon Key from Settings → API
4. Add them to `frontend/.env`
5. Run the database migrations (see `README.md`)

## Step 4: Access the Website

Once the server starts, open your browser and go to:

**http://localhost:3000**

You should see the Prema's Shop homepage!

## Manual Setup (If Script Doesn't Work)

### Install Dependencies
```powershell
cd frontend
npm install
```

### Create .env File
Create `frontend/.env` with:
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Start Development Server
```powershell
npm run dev
```

## Troubleshooting

### "npm is not recognized"
- Node.js is not installed or not in PATH
- Restart PowerShell after installing Node.js
- Or reinstall Node.js and make sure "Add to PATH" is checked

### "Cannot find module" errors
- Run `npm install` in the `frontend` directory
- Delete `node_modules` folder and `package-lock.json`, then run `npm install` again

### Website shows errors
- Check browser console (F12) for errors
- Make sure `.env` file has correct Supabase credentials
- Verify Supabase project is active and migrations are run

### Port 3000 already in use
- Stop other applications using port 3000
- Or change port in `vite.config.ts`

## What You'll See

- **Homepage**: Welcome page with featured products
- **Catalog**: Browse all products
- **Cart**: Shopping cart
- **Checkout**: Order placement
- **Admin Panel**: `/admin/dashboard` (requires admin account)
- **Delivery Dashboard**: `/delivery/dashboard` (requires delivery partner account)

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Run database migrations
3. ✅ Create admin user
4. ✅ Add products via admin panel
5. ✅ Test the full flow

See `README.md` for complete setup instructions!

