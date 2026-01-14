#!/bin/bash

# Vercel Deployment Script
# This script helps you prepare and deploy to Vercel

set -e

echo "🚀 Alvant Backend - Vercel Deployment Script"
echo "============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm is installed: $(npm --version)"
echo ""

# Step 1: Install dependencies
echo "Step 1: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 2: Check .env file
echo "Step 2: Checking environment configuration..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "⚠️  .env file not found. Creating from .env.example..."
        cp .env.example .env
        echo "⚠️  IMPORTANT: Please edit .env with your actual configuration:"
        echo "   - MONGODB_URI"
        echo "   - ADMIN_EMAIL"
        echo "   - ADMIN_JWT_SECRET"
        echo "   - CORS_ORIGIN"
        echo "   - EMAIL_USER and EMAIL_PASS"
        echo ""
        read -p "Press Enter after updating .env file..."
    else
        echo "❌ .env.example not found"
        exit 1
    fi
else
    echo "✅ .env file exists"
fi
echo ""

# Step 3: Test locally
echo "Step 3: Testing application locally..."
timeout 10 npm run dev &
sleep 5
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Application is running and responding to requests"
else
    echo "⚠️  Could not verify local connection (this is ok if you have network issues)"
fi
echo ""

# Step 4: Install Vercel CLI
echo "Step 4: Setting up Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi
echo "✅ Vercel CLI is ready"
echo ""

# Step 5: Deploy
echo "Step 5: Deploying to Vercel..."
echo "You will be prompted to:"
echo "1. Link to a Vercel project (or create new)"
echo "2. Confirm project settings"
echo ""
read -p "Ready to deploy? Press Enter to continue..."
vercel

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Add environment variables in Vercel dashboard"
echo "2. Verify your deployment at the provided URL"
echo "3. Test the /api/health endpoint"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
