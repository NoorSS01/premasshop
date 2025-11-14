# Deployment Checklist for Prema's Shop

Use this checklist to ensure all steps are completed before going live.

## 🔵 Supabase Setup

### Project Creation
- [ ] Created Supabase project at https://app.supabase.com
- [ ] Noted Project URL: `https://xxxxx.supabase.co`
- [ ] Noted Anon Key: `eyJ...`
- [ ] Noted Service Role Key: `eyJ...` (keep secret!)

### Database Setup
- [ ] Opened SQL Editor in Supabase Dashboard
- [ ] Copied content from `migrations/001_initial_schema.sql`
- [ ] Executed migration (clicked "Run")
- [ ] Copied content from `migrations/002_seed_data.sql`
- [ ] Executed seed data migration
- [ ] Verified tables created: `users`, `products`, `orders`, `delivery_partners`, `payments`, `settings`

### Authentication Setup
- [ ] Went to Authentication → Settings
- [ ] Enabled Email provider
- [ ] Set Site URL to: `https://premas.shop`
- [ ] Created admin user via Authentication → Users
- [ ] Updated admin role via SQL:
  ```sql
  UPDATE public.users SET role = 'admin' WHERE email = 'YOUR_ADMIN_EMAIL';
  ```

### Edge Functions Setup
- [ ] Installed Supabase CLI: `npm install -g supabase`
- [ ] Logged in: `supabase login`
- [ ] Linked project: `supabase link --project-ref YOUR_PROJECT_REF`
- [ ] Deployed `payment-initiate` function
- [ ] Deployed `payment-webhook` function
- [ ] Deployed `assign-order` function
- [ ] Deployed `mark-delivered` function
- [ ] Deployed `confirm-delivery` function

### Edge Function Secrets
Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets and add:

- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `your_service_role_key`
- [ ] `PAYU_MERCHANT_ID` = `your_merchant_id` (or leave empty for prototype)
- [ ] `PAYU_CLIENT_ID` = `your_client_id` (or leave empty for prototype)
- [ ] `PAYU_CLIENT_SECRET` = `your_client_secret` (or leave empty for prototype)
- [ ] `PAYU_WEBHOOK_SECRET` = `your_webhook_secret` (optional)
- [ ] `APP_URL` = `https://premas.shop`
- [ ] `SMTP_HOST` = `smtp.example.com` (or Supabase SMTP)
- [ ] `SMTP_PORT` = `587`
- [ ] `SMTP_USER` = `your_smtp_user`
- [ ] `SMTP_PASS` = `your_smtp_password`

## 🟢 PayU Setup

### Account Creation
- [ ] Signed up at https://www.payu.in/
- [ ] Completed KYC verification
- [ ] Provided bank details for settlements
- [ ] Received account approval email

### Credentials
- [ ] Received Merchant ID
- [ ] Received Client ID
- [ ] Received Client Secret
- [ ] Received Webhook Secret (if provided)

### Webhook Configuration
- [ ] Logged into PayU Dashboard
- [ ] Went to Integration → Webhooks
- [ ] Added webhook URL: `https://YOUR_PROJECT.supabase.co/functions/v1/payment-webhook`
- [ ] Saved webhook secret (if provided)
- [ ] Tested webhook with sample payload (if possible)

**Webhook URL to copy:**
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/payment-webhook
```

## 🟡 Hostinger Setup

### Domain Configuration
- [ ] Logged into Hostinger Control Panel
- [ ] Went to Domains → DNS Settings
- [ ] Added/Updated A record:
  - Type: `A`
  - Name: `@` (or `premas`)
  - Value: `YOUR_SERVER_IP`
- [ ] Added CNAME for www (optional):
  - Type: `CNAME`
  - Name: `www`
  - Value: `premas.shop`

### File Upload
- [ ] Built frontend: `cd frontend && npm run build`
- [ ] Connected via FTP or File Manager
- [ ] Uploaded all files from `frontend/dist` to `public_html`
- [ ] Verified `index.html` is in root directory
- [ ] Set correct file permissions (644 for files, 755 for directories)

### Environment Variables (if using Node.js hosting)
- [ ] Set `VITE_SUPABASE_URL` in hosting control panel
- [ ] Set `VITE_SUPABASE_ANON_KEY` in hosting control panel

## 🟣 Application Configuration

### Frontend Environment
- [ ] Created `.env` file in `frontend/` directory
- [ ] Added `VITE_SUPABASE_URL=https://xxxxx.supabase.co`
- [ ] Added `VITE_SUPABASE_ANON_KEY=your_anon_key`
- [ ] Rebuilt frontend: `npm run build`

### Logo Upload
- [ ] Replaced `frontend/public/logo.png` with actual logo
- [ ] Ensured logo is optimized (PNG/SVG, reasonable size)
- [ ] Rebuilt and redeployed

## 🧪 Testing Checklist

### Customer Flow
- [ ] Tested customer signup at `/signup`
- [ ] Tested customer login at `/login`
- [ ] Browsed catalog at `/catalog`
- [ ] Viewed product page
- [ ] Added product to cart
- [ ] Completed checkout with COD
- [ ] Received order confirmation
- [ ] Viewed order in order history
- [ ] Tested order tracking page

### Delivery Partner Flow
- [ ] Tested delivery partner signup at `/delivery/signup`
- [ ] Verified signup request appears in admin panel
- [ ] Admin approved delivery partner
- [ ] Delivery partner logged in
- [ ] Delivery partner viewed assigned orders
- [ ] Delivery partner marked order as delivered
- [ ] Customer received confirmation request
- [ ] Customer confirmed delivery

### Admin Flow
- [ ] Admin logged in
- [ ] Viewed dashboard with stats
- [ ] Added new product
- [ ] Edited product
- [ ] Viewed orders list
- [ ] Assigned order to delivery partner
- [ ] Toggled auto-assign setting
- [ ] Approved delivery partner signup
- [ ] Paused delivery partner
- [ ] Viewed delivery partner list

### Payment Flow (if PayU configured)
- [ ] Selected UPI payment at checkout
- [ ] Redirected to PayU payment page
- [ ] Completed test payment
- [ ] Received payment success callback
- [ ] Order status updated to "paid"
- [ ] Received email confirmation

### Prototype Mode (if PayU not configured)
- [ ] Verified prototype message appears
- [ ] COD payments work correctly
- [ ] UPI option shows "not configured" message

## 🔍 Final Verification

- [ ] Domain `premas.shop` loads correctly
- [ ] HTTPS is enabled (SSL certificate active)
- [ ] All pages load without errors
- [ ] No console errors
- [ ] Mobile responsive design works (tested at 390px width)
- [ ] Images load correctly
- [ ] Forms submit successfully
- [ ] Email notifications work (if SMTP configured)

## 📋 Post-Deployment

- [ ] Monitor Supabase Dashboard for errors
- [ ] Check Edge Function logs regularly
- [ ] Monitor PayU dashboard for payment issues
- [ ] Set up backup strategy for database
- [ ] Configure monitoring/analytics (optional)
- [ ] Document any custom configurations

## 🆘 If Something Goes Wrong

1. **Check Supabase Logs**: Dashboard → Logs
2. **Check Edge Function Logs**: Dashboard → Edge Functions → Logs
3. **Check Browser Console**: F12 → Console tab
4. **Verify Environment Variables**: Ensure all are set correctly
5. **Test Database Connection**: Run a simple query in SQL Editor
6. **Verify RLS Policies**: Check if policies allow your operations

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

**Last Updated**: _______________

**Deployed By**: _______________

