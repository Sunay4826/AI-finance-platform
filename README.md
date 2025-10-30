# AI Finance Platform

A Next.js app with Clerk auth, Prisma + Postgres, and Tailwind. Track transactions, budgets, and get AI insights.

## Quick start

1. Clone and install
```bash
npm ci
```

2. Create `.env` (see variables below)

3. Setup database
```bash
npx prisma generate
npx prisma migrate deploy
```

4. Run locally
```bash
npm run dev
```
App runs on http://localhost:3000

### Make sure to create a `.env` file with following variables -

```
DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

OPENAI_API_KEY=

RESEND_API_KEY=

ARCJET_KEY=
```

## Deploy

### Recommended: Vercel (Best for this app)

**With GitHub Actions:**
1. Create project on [vercel.com](https://vercel.com)
2. Add environment variables in Vercel dashboard
3. Get tokens from Vercel Project Settings → General
4. Add GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
5. Push to `main` - auto deploys via GitHub Actions

**Alternative:** GitHub Pages (Limited - see deployment docs)
- ⚠️ Static export only - many features won't work
- No database, authentication, or API routes
- Not recommended for this app

**📖 Need detailed steps?** → See [STEPS_FOR_DEPLOYMENT.md](./STEPS_FOR_DEPLOYMENT.md)  
**📚 Full deployment guide** → [DEPLOYMENT.md](./DEPLOYMENT.md)

## Useful commands

- Build: `npm run build`
- Start: `npm start`
- Lint: `npm run lint`
- Migrate (prod): `npx prisma migrate deploy`

## Notes

- Clerk URLs are already set to in-app routes: `/sign-in`, `/sign-up`
- Optional: `RESEND_API_KEY` for emails, `ARCJET_KEY` for rate limiting, `OPENAI_API_KEY` for AI features
