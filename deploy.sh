#!/bin/bash

# Premas Shop Deployment Script
# This script builds the React project and deploys it to Hostinger

echo "🚀 Starting Premas Shop Deployment..."

# Step 1: Build the React project
echo "📦 Building React project..."
cd src-project
npm run build

# Step 2: Copy built files to root directory
echo "📋 Copying built files to root directory..."
cd ..
cp -r dist/* .

# Step 3: Clean up intermediate build folder
echo "🧹 Cleaning up..."
rm -rf dist

echo "✅ Deployment complete! Files are ready for git push."
echo "📁 Root directory now contains the built React app."
echo "🌐 Ready to deploy to Hostinger!"
