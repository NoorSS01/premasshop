# Step-by-Step Setup Guide

## ✅ Step 1: You've Already Done This!
You created `frontend/.env` file - great! 

## 📝 Step 2: Add Your Supabase Credentials to .env

Open the file `frontend/.env` and add your Supabase credentials like this:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**What to use:**
- **VITE_SUPABASE_URL**: Your Project URL (from Supabase Dashboard → Settings → API)
- **VITE_SUPABASE_ANON_KEY**: Your "anon" or "public" key (NOT the service_role key!)

**Example:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.example
```

## 🚀 Step 3: Install Node.js (REQUIRED)

You need Node.js to run the website. Choose one method:

### Method A: Quick Install with Winget
Open PowerShell and run:
```powershell
winget install OpenJS.NodeJS.LTS
```

### Method B: Manual Download
1. Go to: https://nodejs.org/
2. Click the big green "LTS" button to download
3. Run the downloaded installer
4. ✅ **IMPORTANT**: Make sure "Add to PATH" is checked during installation
5. Click "Install"
6. **RESTART PowerShell** after installation

### Verify Node.js is Installed
After installing and restarting PowerShell, run:
```powershell
node --version
npm --version
```

You should see version numbers. If you see errors, Node.js is not installed correctly.

## 📦 Step 4: Install Project Dependencies

Once Node.js is installed:

```powershell
# Make sure you're in the project root
cd C:\Users\mdkai\OneDrive\Documents\premasshop

# Go to frontend folder
cd frontend

# Install all dependencies (this will take a few minutes)
npm install
```

Wait for it to finish. You'll see a lot of text scrolling - that's normal!

## 🗄️ Step 5: Set Up Database (IMPORTANT!)

The website needs database tables. You need to run SQL migrations in Supabase:

1. **Go to your Supabase Dashboard**: https://app.supabase.com
2. **Click on your project**
3. **Go to SQL Editor** (left sidebar)
4. **Click "New query"**
5. **Open the file**: `migrations/001_initial_schema.sql` from this project
6. **Copy ALL the content** from that file
7. **Paste it into the SQL Editor**
8. **Click "Run"** (or press Ctrl+Enter)
9. **Wait for success message**
10. **Repeat for**: `migrations/002_seed_data.sql`

This creates all the tables your website needs!

## 👤 Step 6: Create Admin User

1. In Supabase Dashboard, go to **Authentication → Users**
2. Click **"Add User" → "Create new user"**
3. Enter:
   - Email: `admin@premas.shop` (or your email)
   - Password: (choose a strong password - remember this!)
4. Click "Create user"
5. **Go back to SQL Editor**
6. Run this SQL (replace with your email):
```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@premas.shop';
```
(Replace `admin@premas.shop` with the email you used)

## 🎉 Step 7: Run the Website!

Now you can start the development server:

```powershell
# Make sure you're in the frontend folder
cd C:\Users\mdkai\OneDrive\Documents\premasshop\frontend

# Start the server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**Open your browser and go to: http://localhost:3000**

## 🎯 What You Should See

- Homepage with "Welcome to Prema's Shop"
- You can browse products
- You can sign up/login
- Admin panel at `/admin/dashboard` (use the admin account you created)

## ❓ Common Issues

### "npm is not recognized"
- Node.js is not installed or not in PATH
- Restart PowerShell after installing Node.js

### "Cannot connect to Supabase"
- Check your `.env` file has correct credentials
- Make sure you're using the **anon key**, not service_role key

### "Table does not exist" errors
- You haven't run the database migrations
- Go back to Step 5 and run the SQL files

### Website shows blank page
- Open browser console (F12) and check for errors
- Make sure `.env` file is in `frontend/` folder (not root)

## 📋 Quick Checklist

- [ ] Created `frontend/.env` file
- [ ] Added Supabase URL and Anon Key to `.env`
- [ ] Installed Node.js
- [ ] Ran `npm install` in frontend folder
- [ ] Ran database migrations in Supabase SQL Editor
- [ ] Created admin user
- [ ] Ran `npm run dev`
- [ ] Opened http://localhost:3000 in browser

## 🆘 Need Help?

If you get stuck at any step, tell me:
1. Which step you're on
2. What error message you see (if any)
3. What you've already done

I'll help you fix it!

