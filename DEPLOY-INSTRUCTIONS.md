# 🚀 DEPLOYMENT INSTRUCTIONS FOR PREMA'S SHOP

## ✅ OPTION 1: VERCEL (RECOMMENDED - FREE)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow prompts:**
   - Login with GitHub/Email
   - Confirm project settings
   - Deploy!

5. **Set Environment Variables in Vercel Dashboard:**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL` = your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

---

## ✅ OPTION 2: NETLIFY (ALSO FREE)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the app:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

4. **Set Environment Variables:**
   - Go to Netlify dashboard
   - Site settings → Environment variables
   - Add the same variables as above

---

## ✅ OPTION 3: HOSTINGER (STATIC HOSTING)

**IMPORTANT:** You need to use Hostinger's **Static Website Hosting**, NOT PHP hosting!

1. **Build the app locally:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload the `dist` folder contents:**
   - Go to Hostinger File Manager
   - Navigate to `public_html`
   - Upload ALL files from `frontend/dist` folder
   - NOT the dist folder itself, but the files INSIDE it

3. **Create .htaccess file in public_html:**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

4. **Set up Environment Variables:**
   - Create a `.env.production` file in frontend folder BEFORE building
   - Add your Supabase credentials
   - Rebuild: `npm run build`
   - Re-upload dist folder contents

---

## 🔧 ENVIRONMENT VARIABLES NEEDED:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from:
- Supabase Dashboard → Project Settings → API

---

## ⚠️ COMMON MISTAKES:

1. **Don't deploy the whole project folder** - Only deploy the built files (dist folder)
2. **Don't use PHP hosting for React apps** - Use static hosting
3. **Don't forget environment variables** - App won't work without Supabase credentials
4. **Don't upload the dist folder itself** - Upload the CONTENTS of dist folder

---

## 🎯 RECOMMENDED: VERCEL

Vercel is the easiest and best option for React apps:
- ✅ Free forever for personal projects
- ✅ Automatic deployments from Git
- ✅ Built-in environment variables
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Zero configuration needed

Just run: `vercel` in the frontend folder and you're done!
