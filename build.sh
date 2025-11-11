#!/bin/bash
# Build script for Hostinger deployment

echo "🔧 Installing dependencies..."
cd frontend
npm install

echo "🏗️ Building React app..."
npm run build

echo "📋 Copying .htaccess and moving to public_html..."
cd ..
cp frontend/public/.htaccess frontend/dist/.htaccess 2>/dev/null || echo "Note: .htaccess copy skipped"

# Move to public_html if it exists
if [ -d "public_html" ]; then
    echo "📁 Moving files to public_html..."
    cp -r frontend/dist/* public_html/
    echo "✅ Files moved to public_html!"
else
    echo "✅ Build complete! Output in frontend/dist/ folder"
fi
