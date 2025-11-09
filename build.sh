#!/bin/bash
# Build script for Hostinger deployment

echo "🔧 Installing dependencies..."
cd frontend
npm install

echo "🏗️ Building React app..."
npm run build

echo "📋 Copying .htaccess..."
cd ..
cp frontend/public/.htaccess dist/.htaccess 2>/dev/null || echo "Note: .htaccess copy skipped"

echo "✅ Build complete! Output in dist/ folder"
