# 🚀 Premas Shop Deployment Guide

## 📁 Project Structure

```
premasshop/
├── src-project/          # React source code
│   ├── src/             # React components and pages
│   ├── package.json     # Dependencies
│   ├── vite.config.ts   # Build configuration
│   └── ...              # Other source files
├── index.html           # Built React app (for Hostinger)
├── assets/              # Built CSS and JS files
├── manifest.json        # PWA manifest
├── favicon.ico          # Favicon
└── ...                  # Other deployment files
```

## 🔄 Development Workflow

### 1. Make Changes to Source Code
```bash
# Work in the src-project directory
cd src-project/src/
# Edit your React components, pages, etc.
```

### 2. Build the Project
```bash
# From project root
cd src-project
npm run build
```

### 3. Deploy to Hostinger
```bash
# Copy built files to root directory
cd ..
cp -r dist/* .

# Or use the deployment script
./deploy.sh
```

### 4. Commit and Push
```bash
git add .
git commit -m "Update and deploy"
git push
```

## 🎯 Key Points

- **Source files**: `src-project/src/`
- **Built files**: Root directory (what Hostinger serves)
- **Build output**: `src-project/dist/` → copied to root
- **Assets**: `/assets/` folder contains minified CSS/JS
- **Entry point**: `index.html` in root directory

## 🌐 Hostinger Deployment

Hostinger automatically deploys files from the root directory:
- Serves `index.html` as the main page
- Loads assets from `/assets/` folder
- No PHP or build process needed on server
- Pure static React application

## 📝 Environment Variables

For production, update `src-project/.env.production` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🛠 Quick Commands

```bash
# Full deployment pipeline
./deploy.sh && git add . && git commit -m "Deploy updates" && git push

# Development server
cd src-project && npm run dev

# Build only
cd src-project && npm run build
```
