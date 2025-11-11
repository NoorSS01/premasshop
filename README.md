# Prema's Shop (Production-Ready Redesign)

Modern quick-commerce web app with Vite + React (TypeScript) frontend and Supabase backend (auth, database, and Edge Functions). This branch prepares the app for production with linting/formatting, CI, DB schema fixes, and UX improvements.

## Tech Stack
- Frontend: React + TypeScript (Vite), React Router, TailwindCSS
- Backend: Supabase (Auth, Postgres, RLS, Edge Functions)
- Data: Postgres on Supabase (with RLS), `products`, `orders`, `order_items`, etc.
- Testing: Vitest + React Testing Library (unit), Jest (integration)
- CI: GitHub Actions
- Lint/Format: ESLint + Prettier, Husky pre-commit

## Prerequisites
- Node.js 20+
- npm 9+
- Supabase project (URL, anon key, service role key)

## Environment Variables
Set these in your environment or your Hostinger control panel as app variables:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- SUPABASE_URL (same as VITE_SUPABASE_URL)
- SUPABASE_ANON_KEY (same as VITE_SUPABASE_ANON_KEY)
- SUPABASE_SERVICE_ROLE_KEY
- VITE_APP_URL (e.g., http://localhost:5173 or your production domain)

## Install and Run Locally
```bash
# from repository root
npm install
cd frontend && npm install && cd ..

# start dev (Vite)
npm run dev
```

## Tests
```bash
# Unit tests (frontend)
cd frontend
npm test -- --run

# Integration tests (Jest) - requires Supabase env vars
cd ../tests
VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... npm test
```

## Lint and Format
```bash
npm run lint
npm run format
```

## Build
```bash
npm run build
```

## Database Migrations
Run SQL in Supabase SQL Editor in order:
- `migrations/001_initial_schema.sql`
- `migrations/002_seed_data.sql`
- `migrations/003_products_categories_and_order_items.sql`

Or via helper (requires service role; may need manual SQL editor if RPC is not available):
```bash
npm run migrate
```

## Deployment (Hostinger)
1. Build locally:
   ```bash
   npm run build
   ```
2. Deploy frontend artifacts via Hostinger’s Node app or static hosting:
   - If using Node app: serve `frontend/dist` with a lightweight server (e.g., `serve`) or configure Hostinger to point to the `dist` as static.
   - If using static hosting/FTP: upload `frontend/dist` contents to `public_html` (or your static root).
3. Configure Environment Variables in Hostinger:
   - VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
   - SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (for Edge/webhook backends you might proxy or host externally)
4. DNS and HTTPS:
   - Point your domain A/AAAA records to Hostinger.
   - Enable HTTPS via Hostinger’s SSL (Let’s Encrypt).
5. Verify:
   - Homepage loads and is HTTPS.
   - `/robots.txt` and `/sitemap.xml` resolve.
   - Products render, cart and checkout flow works.
   - Order creation persists and appears in Delivery and Admin pages.

## GitHub Actions CI
CI runs on PRs and pushes to `main` and `feature/redesign-production`:
- Lints, unit tests, build the frontend, and runs integration tests (if Supabase env secrets are configured in repo settings).

## Branch/PR Workflow
```bash
git checkout -b feature/redesign-production
# make changes, commit small atomic edits
git push -u origin feature/redesign-production
```
Open a PR to `main` with:
- Summary of changes, screenshots for UI where helpful
- Schema changes and migration order
- Any manual steps for Hostinger

Once merged:
```bash
git checkout main
git pull
git tag v1.0.0 -m "Production-ready redesign"
git push origin v1.0.0
```

## Security & Performance
- RLS policies enforced (see `001_initial_schema.sql`)
- Input sanitation handled by client validation; extend with server-side validations in Edge Functions where applicable
- Rate limit sensitive endpoints via Supabase/edge middleware if enabled; otherwise add a proxy with rate limiting
- CSP and headers should be configured at hosting/CDN level; add Helmet-equivalent headers if serving via Node
- Images lazy-loaded; assets built via Vite with code-splitting

## Accessibility & SEO
- WCAG AA-friendly colors and focus styles via Tailwind classes
- Meta tags, Open Graph/Twitter tags in `frontend/index.html`
- `frontend/public/robots.txt` and `frontend/public/sitemap.xml` are present

## Notes and Assumptions
- Authentication screens are preserved as-is per request.
- Auto-assign delivery is supported by an admin-only `assign-order` function; for full auto-assignment, add a DB trigger or a server job to call it on order creation.
- The schema now includes `order_items` and product `category` fields to support richer catalog/admin views.

# Prema's Shop - Premium Quick Commerce Platform

A production-ready, mobile-first e-commerce platform built with React, Tailwind CSS, Supabase, and PayU payment integration.

## 🚀 Features

- **Three User Roles**: Customer, Delivery Partner, and Admin panels
- **Mobile-First Design**: Optimized for 390px width, responsive for all devices
- **Payment Integration**: PayU for UPI payments + Cash on Delivery (COD)
- **Order Management**: Automatic and manual order assignment to delivery partners
- **Delivery Confirmation**: Two-step confirmation flow (partner marks → customer confirms)
- **Admin Dashboard**: Analytics, charts, order management, and delivery partner approval
- **Real-time Updates**: Built with React Query for efficient data fetching

## 📁 Project Structure

```
premasshop/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts (Auth, Cart)
│   │   └── lib/          # Utilities and Supabase client
│   └── package.json
├── functions/            # Supabase Edge Functions
│   ├── payment-initiate/
│   ├── payment-webhook/
│   ├── assign-order/
│   ├── mark-delivered/
│   └── confirm-delivery/
├── migrations/           # Database migration SQL files
│   ├── 001_initial_schema.sql
│   └── 002_seed_data.sql
├── tests/               # Integration tests
└── README.md
```

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth + Postgres)
- **Payments**: PayU
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts
- **Hosting**: Hostinger (frontend), Supabase (backend)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- PayU merchant account (for production payments)
- Hostinger hosting account

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
# Install root dependencies (if any)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Supabase Setup

#### 2.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details (name, database password, region)
4. Wait for project to be created
5. Note down:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon/Public Key
   - Service Role Key (⚠️ Keep this secret!)

#### 2.2 Run Database Migrations

1. Go to Supabase Dashboard → SQL Editor
2. Open `migrations/001_initial_schema.sql`
3. Copy and paste the entire content
4. Click "Run" to execute
5. Repeat for `migrations/002_seed_data.sql`

#### 2.3 Configure Auth

1. Go to Authentication → Settings
2. Enable Email provider
3. Configure email templates (optional)
4. Set Site URL to your domain (e.g., `https://premas.shop`)

#### 2.4 Create Admin User

1. Go to Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter admin email and password
4. After user is created, note the user ID
5. Go to SQL Editor and run:

```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'YOUR_ADMIN_EMAIL@example.com';
```

Replace `YOUR_ADMIN_EMAIL@example.com` with your actual admin email.

### 3. Environment Variables

Create `.env` file in the `frontend` directory:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

For Edge Functions, set these in Supabase Dashboard → Project Settings → Edge Functions → Secrets:

```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PAYU_MERCHANT_ID=your_merchant_id
PAYU_CLIENT_ID=your_client_id
PAYU_CLIENT_SECRET=your_client_secret
PAYU_WEBHOOK_SECRET=your_webhook_secret (if provided)
APP_URL=https://premas.shop
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### 4. PayU Setup

#### 4.1 Create PayU Merchant Account

1. Go to [PayU India](https://www.payu.in/)
2. Sign up for a merchant account
3. Complete KYC verification
4. Provide bank details for settlements
5. Wait for account approval

#### 4.2 Get PayU Credentials

After approval, you'll receive:
- Merchant ID
- Client ID
- Client Secret
- Webhook Secret (if applicable)

#### 4.3 Configure Webhook URL

1. Log in to PayU Dashboard
2. Go to Integration → Webhooks
3. Add webhook URL: `https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/payment-webhook`
4. Save the webhook secret (if provided)

### 5. Deploy Supabase Edge Functions

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
cd functions
supabase functions deploy payment-initiate
supabase functions deploy payment-webhook
supabase functions deploy assign-order
supabase functions deploy mark-delivered
supabase functions deploy confirm-delivery
```

### 6. Build and Deploy Frontend

#### 6.1 Build for Production

```bash
cd frontend
npm run build
```

This creates a `dist` folder with production-ready files.

#### 6.2 Deploy to Hostinger

1. Log in to Hostinger Control Panel
2. Go to File Manager or use FTP
3. Upload all files from `frontend/dist` to your domain's `public_html` folder
4. Ensure `index.html` is in the root

#### 6.3 Configure Domain

1. In Hostinger, go to Domains → DNS Settings
2. Add/update A record:
   - Type: A
   - Name: @ (or premas)
   - Value: Your server IP
3. Add CNAME for www (optional):
   - Type: CNAME
   - Name: www
   - Value: premas.shop

### 7. Upload Logo

1. Replace `frontend/public/logo.png` with your actual logo
2. Ensure it's optimized for web (PNG or SVG, reasonable file size)
3. Rebuild and redeploy

## 🧪 Testing

### Run Unit Tests

```bash
cd frontend
npm test
```

### Run Integration Tests

```bash
cd tests
npm test
```

## 📝 Manual Setup Checklist

### ✅ Supabase

- [ ] Create Supabase project
- [ ] Run migration `001_initial_schema.sql`
- [ ] Run migration `002_seed_data.sql`
- [ ] Create admin user and update role
- [ ] Configure email provider in Auth settings
- [ ] Set environment variables for Edge Functions
- [ ] Deploy all Edge Functions

### ✅ PayU

- [ ] Create PayU merchant account
- [ ] Complete KYC and bank details
- [ ] Obtain Merchant ID, Client ID, Client Secret
- [ ] Configure webhook URL in PayU dashboard
- [ ] Note webhook secret (if provided)
- [ ] Add PayU credentials to Supabase Edge Function secrets

### ✅ Hostinger

- [ ] Configure domain DNS (A record)
- [ ] Upload frontend build files
- [ ] Set environment variables (if using Node.js hosting)
- [ ] Test domain accessibility

### ✅ Application

- [ ] Upload logo file (`logo.png`)
- [ ] Update `.env` file with Supabase credentials
- [ ] Test customer signup/login
- [ ] Test delivery partner signup
- [ ] Test admin login and approve delivery partner
- [ ] Test order creation (COD)
- [ ] Test PayU payment flow (if configured)
- [ ] Test order assignment
- [ ] Test delivery confirmation flow

## 🔒 Security Notes

- **Never commit** `.env` files or secrets to Git
- Use Supabase Row Level Security (RLS) policies (already configured)
- Verify PayU webhook signatures
- Use HTTPS in production
- Regularly update dependencies

## 🐛 Troubleshooting

### PayU Payments Not Working

- Check if PayU credentials are set in Edge Function secrets
- Verify webhook URL is correctly configured in PayU dashboard
- Check Edge Function logs in Supabase Dashboard

### Database Connection Issues

- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in frontend `.env`
- Check Supabase project status
- Verify RLS policies allow your operations

### Edge Functions Not Deploying

- Ensure Supabase CLI is logged in
- Check project reference is correct
- Verify function code has no syntax errors

## 📞 Support

For issues or questions:
1. Check Supabase logs in Dashboard
2. Review Edge Function logs
3. Check browser console for frontend errors

## 📄 License

MIT License - See LICENSE file for details

## 🎯 Next Steps

1. Customize product catalog
2. Add more products via Admin panel
3. Configure email templates in Supabase
4. Set up monitoring and analytics
5. Optimize images and assets
6. Add more delivery partners

---

**Note**: This is a production-ready codebase. Ensure all environment variables are properly set and all manual setup steps are completed before going live.

