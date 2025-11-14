# Manual Steps That Cannot Be Automated

This document lists all steps that **must be done manually** and cannot be automated by Cursor or code generation.

## 🚫 Steps That Require Manual Action

### 1. PayU Merchant Account Creation
**Why**: Requires business verification, KYC, and bank account details
**Steps**:
1. Visit https://www.payu.in/
2. Sign up for a merchant account
3. Complete business registration
4. Submit KYC documents
5. Provide bank account details for settlements
6. Wait for account approval (typically 2-5 business days)
7. Receive credentials via email:
   - Merchant ID
   - Client ID
   - Client Secret
   - Webhook Secret (if provided)

**Where to add credentials**: Supabase Dashboard → Project Settings → Edge Functions → Secrets

---

### 2. PayU Webhook URL Registration
**Why**: Must be configured in PayU dashboard after deployment
**Steps**:
1. Log into PayU Dashboard
2. Navigate to Integration → Webhooks
3. Add webhook URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/payment-webhook`
4. Save the webhook secret (if provided)
5. Test webhook (if test mode available)

**Note**: Replace `YOUR_PROJECT_REF` with your actual Supabase project reference.

---

### 3. Supabase Project Creation
**Why**: Requires account creation and manual project setup
**Steps**:
1. Visit https://app.supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name
   - Database password (save this!)
   - Region (choose closest to your users)
5. Wait for project creation (2-3 minutes)
6. Note down:
   - Project URL
   - Anon/Public Key
   - Service Role Key (⚠️ Keep secret!)

**Where to use**: 
- Project URL → `VITE_SUPABASE_URL` in frontend `.env`
- Anon Key → `VITE_SUPABASE_ANON_KEY` in frontend `.env`
- Service Role Key → Edge Function secrets

---

### 4. Database Migrations Execution
**Why**: Must be run manually in Supabase SQL Editor
**Steps**:
1. Open Supabase Dashboard → SQL Editor
2. Open `migrations/001_initial_schema.sql`
3. Copy entire file content
4. Paste into SQL Editor
5. Click "Run" button
6. Verify success message
7. Repeat for `migrations/002_seed_data.sql`

**Verification**: Check Tables section to confirm all tables are created.

---

### 5. Admin User Creation and Role Assignment
**Why**: Requires manual user creation and SQL update
**Steps**:
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter:
   - Email: `admin@premas.shop` (or your admin email)
   - Password: (choose a strong password)
4. Note the user ID from the created user
5. Go to SQL Editor
6. Run:
   ```sql
   UPDATE public.users 
   SET role = 'admin' 
   WHERE email = 'YOUR_ADMIN_EMAIL@example.com';
   ```
7. Replace `YOUR_ADMIN_EMAIL@example.com` with actual admin email

**Verification**: Log in with admin credentials and verify access to `/admin/dashboard`

---

### 6. SMTP Configuration
**Why**: Email service requires manual configuration
**Options**:

**Option A: Use Supabase SMTP (Recommended)**
1. Go to Supabase Dashboard → Project Settings → Auth
2. Scroll to "SMTP Settings"
3. Enable SMTP
4. Configure:
   - SMTP Host: (provided by Supabase or your email provider)
   - SMTP Port: 587 (TLS) or 465 (SSL)
   - SMTP User: Your email address
   - SMTP Password: Your email password or app password
5. Save settings

**Option B: Use Hostinger Email SMTP**
1. Log into Hostinger Control Panel
2. Go to Email → Email Accounts
3. Create email account (e.g., `noreply@premas.shop`)
4. Note SMTP settings:
   - Host: `smtp.hostinger.com`
   - Port: 587
   - Username: `noreply@premas.shop`
   - Password: (your email password)
5. Add these to Edge Function secrets

**Where to add**: Supabase Dashboard → Project Settings → Edge Functions → Secrets

---

### 7. Domain DNS Configuration
**Why**: DNS changes require access to domain registrar
**Steps**:
1. Log into Hostinger Control Panel (or your domain registrar)
2. Go to Domains → DNS Settings
3. Find DNS management for `premas.shop`
4. Add/Update A record:
   - Type: `A`
   - Name: `@` (or leave blank for root domain)
   - Value: Your hosting server IP address
   - TTL: 3600 (or default)
5. (Optional) Add CNAME for www:
   - Type: `CNAME`
   - Name: `www`
   - Value: `premas.shop`
   - TTL: 3600
6. Wait for DNS propagation (can take up to 48 hours, usually 1-2 hours)

**Verification**: Use `nslookup premas.shop` or online DNS checker to verify.

---

### 8. Logo File Upload
**Why**: Logo is a design asset that must be provided
**Steps**:
1. Prepare logo file:
   - Format: PNG or SVG (recommended)
   - Size: 200x200px or similar aspect ratio
   - File size: Optimized for web (< 100KB recommended)
2. Replace `frontend/public/logo.png` with your logo
3. Ensure filename is exactly `logo.png`
4. Rebuild frontend: `cd frontend && npm run build`
5. Redeploy to Hostinger

**Note**: The logo is referenced in `frontend/src/components/Navbar.tsx` as `/logo.png`

---

### 9. Environment Variables Setup
**Why**: Secrets cannot be committed to code
**Steps**:

**Frontend `.env` file** (create in `frontend/` directory):
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**Supabase Edge Function Secrets** (in Dashboard):
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYU_MERCHANT_ID` (if PayU configured)
- `PAYU_CLIENT_ID` (if PayU configured)
- `PAYU_CLIENT_SECRET` (if PayU configured)
- `PAYU_WEBHOOK_SECRET` (if provided)
- `APP_URL=https://premas.shop`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

**Where to add Edge Function secrets**: Supabase Dashboard → Project Settings → Edge Functions → Secrets

---

### 10. Frontend Build and Deployment
**Why**: Build process and file upload require manual steps
**Steps**:
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Create `.env` file with Supabase credentials
4. Build for production: `npm run build`
5. Verify `dist/` folder is created
6. Connect to Hostinger via FTP or File Manager
7. Upload all files from `dist/` to `public_html/` (or root directory)
8. Ensure `index.html` is in the root
9. Set file permissions:
   - Files: 644
   - Directories: 755

**Verification**: Visit `https://premas.shop` and verify site loads.

---

### 11. SSL Certificate Setup
**Why**: HTTPS is required for production
**Steps**:
1. Log into Hostinger Control Panel
2. Go to SSL/TLS settings
3. Enable "Let's Encrypt" SSL (free) or install custom certificate
4. Wait for certificate activation (usually automatic)
5. Force HTTPS redirect (if option available)

**Verification**: Visit `https://premas.shop` and check for padlock icon in browser.

---

## ✅ Quick Reference: Where to Add What

| Item | Where to Add | Location |
|------|-------------|----------|
| Supabase Project URL | Frontend `.env` | `frontend/.env` |
| Supabase Anon Key | Frontend `.env` | `frontend/.env` |
| Supabase Service Role Key | Edge Function Secrets | Supabase Dashboard |
| PayU Credentials | Edge Function Secrets | Supabase Dashboard |
| SMTP Credentials | Edge Function Secrets | Supabase Dashboard |
| Logo File | Replace file | `frontend/public/logo.png` |
| Domain DNS | DNS Settings | Hostinger Control Panel |

---

## 🎯 Post-Setup Verification

After completing all manual steps, verify:

1. ✅ Domain loads: `https://premas.shop`
2. ✅ Customer can sign up and log in
3. ✅ Products display in catalog
4. ✅ Cart and checkout work
5. ✅ Orders can be created
6. ✅ Admin can log in and access dashboard
7. ✅ Delivery partner signup works
8. ✅ Admin can approve delivery partners
9. ✅ Orders can be assigned
10. ✅ Payment flow works (if PayU configured)

---

**Last Updated**: See README.md for latest version

