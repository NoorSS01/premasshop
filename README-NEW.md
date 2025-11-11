# PremasShop - Modern E-Commerce Platform

A complete e-commerce solution built with React, TypeScript, Tailwind CSS, and Supabase.

## ✨ Features

- **Customer Portal**
  - Browse products with beautiful UI
  - Add to cart and checkout
  - Track orders in real-time
  - Manage profile and addresses

- **Admin Dashboard**
  - View sales statistics
  - Manage products and orders
  - Monitor users and delivery partners

- **Delivery Partner Portal** (Coming Soon)
  - Accept delivery assignments
  - Update delivery status
  - Track earnings

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Hostinger account for deployment

### 1. Setup Database

1. Go to [Supabase](https://supabase.com) and create a new project
2. Once your project is ready, go to **SQL Editor**
3. Copy the entire content from `COMPLETE-DATABASE-SETUP.sql`
4. Paste and click **Run**
5. You should see 8 products created

### 2. Configure Environment

1. In Supabase Dashboard, go to **Settings → API**
2. Copy your **Project URL** and **anon key**
3. Navigate to `frontend` folder
4. Create `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install & Run

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📦 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: TanStack Query
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite
- **Deployment**: Hostinger

## 🛠️ Project Structure

```
premasshop/
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and configs
│   │   └── types/           # TypeScript types
│   ├── public/              # Static assets
│   └── package.json
├── COMPLETE-DATABASE-SETUP.sql
└── DEPLOY-TO-HOSTINGER.md
```

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Check code quality
```

## 🔐 Creating Admin User

1. Sign up for a new account on your website
2. Go to Supabase Dashboard → **Table Editor → users**
3. Find your user row
4. Change `role` from `customer` to `admin`
5. Refresh the website
6. You'll now see the Admin menu

## 🚀 Deploy to Hostinger

Follow the detailed guide in `DEPLOY-TO-HOSTINGER.md`

Quick steps:
1. Build the app: `npm run build`
2. Upload `dist` folder contents to Hostinger
3. Configure your domain
4. Done! 🎉

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ Yes |

## 📸 Screenshots

### Customer View
- Beautiful product catalog
- Smooth shopping cart experience
- Order tracking

### Admin Dashboard
- Sales analytics
- Product management
- Order management

## 🐛 Troubleshooting

### TypeScript Errors
Run `npm install` to install all dependencies including lucide-react and sonner.

### Build Errors
1. Make sure you're in the `frontend` directory
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again

### Database Connection Issues
1. Check your `.env` file has correct values
2. Verify Supabase project is active
3. Check browser console for specific errors

### Deployment Issues
1. Ensure all files from `dist` are uploaded
2. Check `.htaccess` for SPA routing
3. Verify domain DNS settings

## 📄 License

MIT License - feel free to use for your projects!

## 🤝 Support

Need help? 
- Check the troubleshooting section
- Review the deployment guide
- Open browser console (F12) to see errors

## 🎯 Roadmap

- [x] Customer product browsing
- [x] Shopping cart functionality
- [x] Order management
- [x] Admin dashboard
- [ ] Delivery partner portal
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Mobile app

---

Built with ❤️ for modern e-commerce
