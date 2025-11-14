# Deploy PremasShop to Hostinger

## Step 1: Setup Database in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project
3. Go to **SQL Editor**
4. Copy the contents of `COMPLETE-DATABASE-SETUP.sql`
5. Paste and click **Run**
6. Wait for confirmation message

## Step 2: Get Supabase Credentials

1. In Supabase Dashboard, go to **Settings → API**
2. Copy your **Project URL**
3. Copy your **anon/public key**

## Step 3: Configure Frontend

1. Navigate to `frontend` folder
2. Create a `.env` file (copy from `.env.example`):
```bash
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Step 4: Build the Application

```bash
cd frontend
npm install
npm run build
```

This creates a `dist` folder with your production files.

## Step 5: Deploy to Hostinger

### Option A: File Manager (Recommended for beginners)

1. Login to [Hostinger Panel](https://hpanel.hostinger.com/)
2. Go to **Files → File Manager**
3. Navigate to `public_html` (or your domain folder)
4. Delete any existing files
5. Upload all files from `frontend/dist` folder
6. Make sure `index.html` is in the root

### Option B: Git Deploy (Advanced)

1. In Hostinger, go to **Advanced → Git**
2. Connect your GitHub repository
3. Set build command: `cd frontend && npm install && npm run build`
4. Set publish directory: `frontend/dist`
5. Deploy

## Step 6: Configure Domain

1. In Hostinger panel, go to **Domains**
2. Point your domain to the `public_html` folder
3. Enable **Force HTTPS**

## Step 7: Create Admin User

1. Open your deployed website
2. Click **Sign Up** and create an account
3. Go to Supabase Dashboard → **Table Editor → users**
4. Find your user and change `role` from `customer` to `admin`
5. Refresh your website

## Done! 🎉

Your PremasShop is now live!

### Important URLs:
- **Customer Site**: https://yourdomain.com
- **Admin Dashboard**: https://yourdomain.com/admin
- **Supabase Dashboard**: https://supabase.com/dashboard

### Troubleshooting

**Issue**: Blank page after deployment
- Check browser console for errors
- Verify `.env` variables are correct
- Ensure all files from `dist` are uploaded

**Issue**: Can't fetch products
- Check Supabase credentials
- Run the SQL setup again
- Check browser network tab for API errors

**Issue**: Orders not working
- Verify database tables exist
- Check user authentication
- Review Supabase logs

Need help? Check the error logs in browser console (F12).
