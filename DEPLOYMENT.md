# Deployment Guide

This project is set up to deploy to **Cloudflare Pages**.

## Recommended: GitHub Integration (Automatic Deployments)

**⭐ The recommended approach is to use GitHub integration for automatic deployments.**

See [GITHUB_INTEGRATION.md](./GITHUB_INTEGRATION.md) for complete setup instructions.

### Quick Setup:
1. Connect your GitHub repo to Cloudflare Pages via the dashboard
2. Push to `main` branch → Automatic deployment
3. No local wrangler commands needed!

---

## Alternative: Manual Local Deployment

If you need to deploy manually from your local machine:

### Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Already installed via npm dependencies

## First-Time Setup

### 1. Login to Cloudflare

```bash
npx wrangler login
```

This will open a browser window to authenticate with Cloudflare.

### 2. Create a Pages Project (First Deployment)

On your first deployment, Wrangler will prompt you to create a new project:

```bash
npm run pages:deploy
```

You'll be asked:
- **Project name**: `reforger-hotas-prod` (or choose your own)
- **Production branch**: `main` (recommended)

## Deployment Commands

### Deploy to Preview (Development)

```bash
npm run pages:deploy
```

This creates a preview deployment with a unique URL for testing.

### Deploy to Production

```bash
npm run pages:deploy:prod
```

This deploys to production (the main branch).

## How It Works

### Build Process

1. **TypeScript compilation**: `vue-tsc` checks types
2. **Vite build**: Bundles and optimizes the application
3. **Output**: Static files in `dist/` folder

The build command:
```bash
npm run build
# Runs: vue-tsc && vite build
```

### Deployment Process

1. Build the project (above)
2. Deploy `dist/` folder to Cloudflare Pages:
   ```bash
   wrangler pages deploy dist
   ```

## CI/CD Setup (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=reforger-hotas-prod
```

### Required GitHub Secrets

1. Go to your repo: **Settings → Secrets and variables → Actions**
2. Add:
   - `CLOUDFLARE_API_TOKEN`: Get from [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - `CLOUDFLARE_ACCOUNT_ID`: Find in Cloudflare Dashboard URL

## Cloudflare Dashboard Setup

### Build Settings (if using Cloudflare's Git integration)

If you connect your Git repository directly to Cloudflare Pages:

- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node version**: 20

### Environment Variables

If your app needs environment variables, add them in:
**Cloudflare Dashboard → Pages → Settings → Environment variables**

## Custom Domain

1. Go to **Cloudflare Pages → Custom domains**
2. Add your domain
3. Cloudflare will automatically configure SSL

## Troubleshooting

### Issue: "Not logged in"

```bash
npx wrangler login
```

### Issue: Build fails

```bash
# Check TypeScript errors
npm run build

# Test locally first
npm run dev
```

### Issue: Deployment fails

```bash
# Check wrangler status
npx wrangler whoami

# Try manual deployment
npx wrangler pages deploy dist --project-name=reforger-hotas-prod
```

### Issue: Old deployment showing

Cloudflare Pages caches aggressively. Solutions:
- Wait 5-10 minutes for CDN cache to clear
- Clear browser cache
- Use incognito/private browsing

## URLs

After deployment, you'll get:
- **Production**: `https://reforger-hotas-prod.pages.dev`
- **Preview**: `https://[commit-hash].reforger-hotas-prod.pages.dev`

## Local Development

```bash
# Development server (hot reload)
npm run dev

# Preview production build locally
npm run preview
```
