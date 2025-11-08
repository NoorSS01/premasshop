# Quick Commands Reference

Copy and paste these commands one by one in PowerShell.

## 1. Install Node.js (if not installed)

```powershell
winget install OpenJS.NodeJS.LTS
```

**Then RESTART PowerShell!**

## 2. Verify Node.js is installed

```powershell
node --version
npm --version
```

Should show version numbers. If not, Node.js isn't installed correctly.

## 3. Navigate to project

```powershell
cd C:\Users\mdkai\OneDrive\Documents\premasshop\frontend
```

## 4. Install dependencies

```powershell
npm install
```

Wait for it to finish (takes 2-5 minutes).

## 5. Start the website

```powershell
npm run dev
```

## 6. Open in browser

Go to: **http://localhost:3000**

---

## Your .env file should look like:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:**
- Use the **anon/public key**, NOT service_role key
- Get these from: Supabase Dashboard → Settings → API

---

## Before running the website, you MUST:

1. ✅ Run database migrations in Supabase SQL Editor
   - Copy content from `migrations/001_initial_schema.sql`
   - Paste in Supabase SQL Editor → Run
   - Repeat for `migrations/002_seed_data.sql`

2. ✅ Create admin user
   - Supabase Dashboard → Authentication → Users → Add User
   - Then run SQL to set role to admin (see STEP_BY_STEP_SETUP.md)

