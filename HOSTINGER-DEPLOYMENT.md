# 🚀 HOSTINGER DEPLOYMENT GUIDE - PREMA'S SHOP

## 🎯 **TWO DEPLOYMENT METHODS:**

### **METHOD 1: GITHUB AUTO-DEPLOYMENT (RECOMMENDED - YOU'RE USING THIS!)**

---

## ✅ STEP 1: SET UP ENVIRONMENT VARIABLES IN HOSTINGER

**IMPORTANT:** When using GitHub deployment, environment variables must be set in Hostinger Dashboard, NOT in `.env.production` file!

1. **Login to Hostinger** → Go to hPanel

2. **Find your website** → Click on it

3. **Look for "GitHub" or "Git" section** → Click "Manage"

4. **Find "Environment Variables" or "Build Settings"**

5. **Add these variables:**
   ```
   Variable Name: VITE_SUPABASE_URL
   Value: https://your-project.supabase.co

   Variable Name: VITE_SUPABASE_ANON_KEY
   Value: your-anon-key-here
   ```
   ⚠️ Use the ANON KEY from Supabase (also called "publishable key")

6. **Save the environment variables**

---

## ✅ STEP 2: PUSH TO GITHUB

1. **Make sure your code is ready:**
   ```bash
   cd c:\Users\mdnoo\OneDrive\Documents\premasshop-main
   ```

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

3. **Hostinger will automatically:**
   - Detect the push
   - Build the app with the environment variables
   - Deploy to your website

4. **Wait 2-5 minutes** for deployment to complete

---

## 🔑 WHERE TO FIND SUPABASE CREDENTIALS:

1. **Go to Supabase Dashboard:** https://supabase.com/dashboard
2. **Select your project**
3. **Click: Settings → API**
4. **Copy these values:**
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_ANON_KEY`
   
**NOTE:** The "anon" key and "publishable" key are the SAME thing!

---

## 📋 QUICK CHECKLIST FOR GITHUB DEPLOYMENT:

Before pushing to GitHub:
- ✅ Database setup complete (run COMPLETE-DATABASE-SETUP.sql in Supabase)
- ✅ Environment variables set in Hostinger Dashboard (not in code!)
- ✅ Code is committed to GitHub
- ✅ Hostinger is connected to your GitHub repo

After pushing:
- ✅ Wait 2-5 minutes for Hostinger to build and deploy
- ✅ Visit your website and test
- ✅ Check browser console for any errors
- ✅ Test login and products loading

---

## ⚠️ COMMON ISSUES WITH GITHUB DEPLOYMENT:

### **Issue: Site shows old version**
- **Solution:** Clear browser cache (Ctrl+Shift+R)
- Check Hostinger deployment logs

### **Issue: Products not loading**
- **Solution:** Check environment variables are set in Hostinger
- Make sure database setup was run in Supabase

### **Issue: "Failed to load products" error**
- **Solution:** Run COMPLETE-DATABASE-SETUP.sql in Supabase
- Check that 8 products were inserted

---

## 🔄 METHOD 2: MANUAL UPLOAD (Alternative)

1. **Login to Hostinger** → Go to hPanel

2. **Find your website** → Click "File Manager"

3. **Navigate to `public_html` folder**

4. **DELETE everything in public_html** (or backup first)

5. **Upload files from the `dist` folder:**
   - Open the `frontend/dist` folder on your computer
   - Select ALL files and folders INSIDE dist (not the dist folder itself)
   - Drag and drop into public_html

6. **Your public_html should now have:**
   ```
   public_html/
   ├── .htaccess
   ├── index.html
   ├── assets/
   │   ├── index-xxxxx.css
   │   └── index-xxxxx.js
   └── ...other files
   ```

---

## ✅ STEP 3: VERIFY DEPLOYMENT

1. **Visit your domain:** `https://premas.shop` (or your actual domain)

2. **Check if site loads:**
   - ✅ Should see the shop homepage
   - ✅ Products should load (if database is set up)
   - ✅ Login/Signup should work

3. **If you see errors:**
   - Check browser console (F12)
   - Check that .env.production had correct Supabase credentials
   - Rebuild and re-upload if environment variables were wrong

---

## ⚠️ COMMON HOSTINGER MISTAKES TO AVOID:

### ❌ DON'T:
- Upload the entire project folder
- Upload the `dist` folder itself
- Use PHP settings/configurations
- Try to run `npm` commands on the server

### ✅ DO:
- Upload ONLY the contents of the `dist` folder
- Make sure .htaccess file is uploaded (it's hidden, but must be there)
- Use the File Manager or FTP
- Set environment variables BEFORE building

---

## 🔧 TROUBLESHOOTING:

### **Problem: 403 Forbidden**
- **Solution:** Make sure index.html is in public_html (not in a subfolder)

### **Problem: White blank page**
- **Solution:** Check browser console for errors
- Rebuild with correct environment variables

### **Problem: Products not loading**
- **Solution:** Run the COMPLETE-DATABASE-SETUP.sql in Supabase first

### **Problem: "Cannot find module" errors**
- **Solution:** Make sure ALL files from dist folder are uploaded

---

## 🔄 HOW TO UPDATE/REDEPLOY:

When you make changes to your code:

1. **Make your code changes**
2. **Rebuild:**
   ```bash
   cd frontend
   npm run build
   ```
3. **Delete old files from public_html**
4. **Upload new files from dist folder**
5. **Hard refresh your browser:** Ctrl+Shift+R

---

## 📋 QUICK CHECKLIST:

Before deploying, make sure:
- ✅ Supabase database is set up (run COMPLETE-DATABASE-SETUP.sql)
- ✅ .env.production file has correct credentials
- ✅ Build completed successfully (no errors)
- ✅ dist folder exists and has files
- ✅ .htaccess file is included in dist folder

After deploying:
- ✅ Visit your domain and check if it loads
- ✅ Try logging in
- ✅ Check if products load
- ✅ Test creating an order

---

## 💡 PRO TIP:

For easier deployment in the future, consider using:
- **Vercel** (free, automatic deployments from Git)
- **Netlify** (free, drag & drop deployment)

But Hostinger works fine if you follow this guide!

---

## 🆘 NEED HELP?

If deployment fails:
1. Check that .env.production has the right Supabase credentials
2. Make sure database setup was run successfully
3. Check browser console for specific error messages
4. Make sure you uploaded files to public_html, not a subfolder
