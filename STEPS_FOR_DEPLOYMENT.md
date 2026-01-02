# 🚀 Step-by-Step Deployment Guide

## ⚠️ FIRST: Which Deployment Method?

This Next.js app has **backend features** that require a server:
- ✅ **Vercel** (BEST CHOICE) - Full support, free, easy
- ⚠️ **GitHub Pages** - Limited, many features won't work

---

## Option 1: Deploy to Vercel (Recommended) 🎯

### Step-by-Step Instructions

#### Step 1: Set up Vercel Account
1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

#### Step 2: Create a New Project
1. Click **"Add New..."** → **"Project"**
2. Find and select your repository (`AI-finance-platform`)
3. Click **"Import"**

#### Step 3: Configure the Project
1. **Framework Preset:** Should be "Next.js" (automatic)
2. **Root Directory:** Leave as `./`
3. Click **"Deploy"** (we'll add environment variables after)

#### Step 4: Add Environment Variables
After first deployment:
1. Go to **Project Dashboard** → **Settings** → **Environment Variables**
2. Add each of these variables:

```env
DATABASE_URL=your_database_connection_string
DIRECT_URL=same_as_database_url

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

OPENAI_API_KEY=sk-proj-your_key

RESEND_API_KEY=your_resend_key
ARCJET_KEY=your_arcjet_key
```

3. Click **"Save"**
4. Go to **Deployments** → Click **"..."** on latest deployment → **"Redeploy"**

#### Step 5: Set Up GitHub Actions (Optional)
For automatic deployments on every push:

1. **Get Vercel Tokens:**
   - Go to Vercel Dashboard → **Settings** → **General**
   - Scroll to **"GitHub"** section
   - Note your **Team ID** and **Project ID**

2. Get API Token:
   - Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Click **"Create Token"**
   - Give it a name and create
   - **Copy the token** (you won't see it again!)

3. **Add to GitHub Secrets:**
   - Go to your GitHub repository
   - Click **Settings** → **Secrets and variables** → **Actions**
   - Click **"New repository secret"**
   - Add these 3 secrets:
     - Name: `VERCEL_TOKEN` → Value: your API token
     - Name: `VERCEL_ORG_ID` → Value: your Team ID
     - Name: `VERCEL_PROJECT_ID` → Value: your Project ID

4. **Push to GitHub:**
   - Every push to `main` branch will now auto-deploy to Vercel!

#### Step 6: Get Your Live URL
1. Vercel will give you a URL like: `https://your-project.vercel.app`
2. Your app is now live! 🎉

---

## Option 2: Deploy to GitHub Pages ⚠️

### ⚠️ WARNING: Limited Functionality

**These features will NOT work:**
- ❌ User authentication
- ❌ Database operations
- ❌ Transaction tracking
- ❌ Budget management
- ❌ AI features
- ❌ Receipt scanning
- ❌ API routes

**Only basic landing pages will work!**

### Step-by-Step Instructions

#### Step 1: Enable GitHub Pages
1. Go to your GitHub repository
2. Click **Settings**
3. Scroll to **Pages** section (left sidebar)
4. Under **Source**, select **"GitHub Actions"**
5. Click **Save**

#### Step 2: Configure Repository Settings
1. Still in **Settings**
2. Go to **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these public variables (optional):
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (if you have it)
5. Click **"Add secret"**

#### Step 3: Push to Main Branch
```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

#### Step 4: Monitor Deployment
1. Go to your repository on GitHub
2. Click **"Actions"** tab
3. Watch the **"Deploy to GitHub Pages"** workflow run
4. Wait for it to complete (usually 2-3 minutes)

#### Step 5: Access Your Site
Your site will be available at:
```
https://Sunay4826.github.io/AI-finance-platform/
```

#### Step 6: Future Updates
Every time you push to `main`, the workflow automatically:
- Builds your static site
- Deploys to GitHub Pages

---

## Need Help Getting Environment Variables?

### Database (Required)
**Option A: Free Cloud Database**
1. Go to [https://supabase.com](https://supabase.com) or [https://neon.tech](https://neon.tech)
2. Create free account
3. Create new project
4. Copy connection string to `DATABASE_URL`

### Clerk Authentication (Required)
1. Go to [https://clerk.com](https://clerk.com)
2. Sign up free
3. Create new application
4. Copy keys from **API Keys** section

### OpenAI API (Optional)
1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up/login
3. Go to **API Keys** → **Create new secret key**
4. Copy the key

---

## Quick Reference

**Deploy to Vercel:** Follow steps 1-6 above  
**Deploy to GitHub Pages:** Follow steps 1-6 above (with limitations)

**Need more help?** Check other documentation files in the repo!

