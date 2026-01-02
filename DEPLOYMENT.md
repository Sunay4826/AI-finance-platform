# 🚀 Deployment Guide

## Quick Deploy Options

### 1. Vercel (Recommended - Easiest)

**Steps:**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Select `Sunay4826/AI-finance-platform`
5. Add Environment Variables:
   ```
   DATABASE_URL=your_database_url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   OPENAI_API_KEY=your_openai_api_key
   RESEND_API_KEY=your_resend_key (optional)
   ARCJET_KEY=your_arcjet_key (optional)
   ```
6. Click "Deploy"

**✅ Benefits:**
- Automatic HTTPS
- Global CDN
- Auto-deploy on every push
- Built for Next.js

### 2. Railway (With Database)

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. New Project → Deploy from GitHub
4. Add PostgreSQL database
5. Add environment variables
6. Deploy automatically

**✅ Benefits:**
- Includes database
- Simple setup
- Good for full-stack apps

### 3. Netlify

**Steps:**
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub
3. Select repository
4. Add environment variables
5. Deploy

### 4. Render

**Steps:**
1. Go to [render.com](https://render.com)
2. Connect GitHub
3. New Web Service
4. Select repository
5. Add environment variables
6. Deploy

## Environment Variables Required

```env
# Database
DATABASE_URL=your_database_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key

# OpenAI API
OPENAI_API_KEY=sk-proj-your_openai_key

# Optional
RESEND_API_KEY=your_resend_key
ARCJET_KEY=your_arcjet_key
```

## Database Setup

### For Vercel/Netlify:
- Use external database (PlanetScale, Supabase, Neon)
- Add DATABASE_URL to environment variables

### For Railway/Render:
- Use built-in PostgreSQL
- Platform will provide DATABASE_URL automatically

## After Deployment

1. **Set up Clerk:**
   - Go to [clerk.com](https://clerk.com)
   - Create application
   - Add your domain to allowed origins
   - Update environment variables

2. **Set up OpenAI:**
   - Go to [platform.openai.com](https://platform.openai.com)
   - Create API key
   - Add to environment variables

3. **Test your app:**
   - Visit your deployed URL
   - Sign up/Sign in
   - Test AI features
   - Test receipt scanning

## Troubleshooting

### Build Errors:
- Check environment variables are set
- Ensure all required keys are provided
- Check build logs for specific errors

### Clerk Errors:
- Verify publishable key format
- Check domain is added to Clerk dashboard
- Ensure redirect URLs are correct

### Database Errors:
- Verify DATABASE_URL is correct
- Run migrations: `npx prisma migrate deploy`
- Check database connection

## Support

If you encounter issues:
1. Check deployment logs
2. Verify environment variables
3. Test locally first
4. Check platform documentation
