# Deployment Guide - Hostinger

This project is fully configured for Hostinger deployment with comprehensive optimizations.

## Build Configuration

- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 18+

## Environment Setup

1. Set up production environment variables in Hostinger:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_production_anon_key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
   ```

## Deployment Methods

### Method 1: Git Integration (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Hostinger
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy automatically on push

### Method 2: Manual Upload

1. Build locally:
   ```bash
   npm run build
   ```

2. Upload the `dist` folder to `public_html` on Hostinger

3. Ensure `.htaccess` is in the root of `public_html`

## Performance Features

- **Code Splitting**: Automatic chunk splitting for vendor libraries
- **Asset Optimization**: Minification and compression
- **Caching**: 1-year cache for static assets
- **Security Headers**: XSS protection, content type options
- **HTTPS Enforcement**: Automatic redirect to HTTPS

## Server Configuration

The `.htaccess` file includes:
- React Router support with rewrite rules
- Static asset optimization
- Security headers
- Gzip compression
- HTTPS enforcement

## Troubleshooting

### 404 Errors on Page Refresh
Ensure `.htaccess` is properly configured and uploaded to the server root.

### Environment Variables Not Working
Make sure all environment variables are prefixed with `VITE_` for Vite.

### Build Issues
Check that all dependencies are installed and Node.js version is 18+.

## Production Checklist

- [ ] Environment variables configured
- [ ] Supabase project set up
- [ ] Domain configured in meta tags
- [ ] Build tested locally
- [ ] SSL certificate active
- [ ] Performance optimizations verified
