# Deployment Guide for Prema's Shop

## 🚀 Quick Deployment Steps

### For Hostinger/Static Hosting:

1. **Build the project:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload the `dist` folder contents** to your hosting provider's public_html or www folder

3. **Create `.htaccess` file** in the root of your hosting directory:
   ```apache
   RewriteEngine On
   RewriteBase /
   
   # Handle Angular and React Router
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   
   # Security headers
   Header always set X-Content-Type-Options nosniff
   Header always set X-Frame-Options DENY
   Header always set X-XSS-Protection "1; mode=block"
   
   # Enable compression
   <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/plain
       AddOutputFilterByType DEFLATE text/html
       AddOutputFilterByType DEFLATE text/xml
       AddOutputFilterByType DEFLATE text/css
       AddOutputFilterByType DEFLATE application/xml
       AddOutputFilterByType DEFLATE application/xhtml+xml
       AddOutputFilterByType DEFLATE application/rss+xml
       AddOutputFilterByType DEFLATE application/javascript
       AddOutputFilterByType DEFLATE application/x-javascript
   </IfModule>
   ```

4. **Set environment variables** in your hosting control panel or create a production .env file

## 🔧 Fix 403 Forbidden Error

The 403 error is likely due to:

1. **Missing index.html** - Make sure you uploaded the built files from `dist/` folder
2. **Wrong directory** - Files should be in `public_html` or `www` folder
3. **Missing .htaccess** - Create the .htaccess file above
4. **File permissions** - Set folder permissions to 755 and files to 644

## 🌐 Environment Variables for Production

Create these in your hosting control panel:

```
VITE_SUPABASE_URL=https://kpyvndiqvwushuhwxvon.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
VITE_APP_URL=https://yourdomain.com
```

## 📱 Update OAuth Redirect URLs

Add your production domain to:
1. **Google Cloud Console** → OAuth redirect URIs
2. **Supabase Dashboard** → Authentication → URL Configuration

## 🔍 Troubleshooting

- **403 Error**: Check file permissions and .htaccess
- **Blank page**: Check browser console for errors
- **Auth not working**: Verify redirect URLs in OAuth providers
