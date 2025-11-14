# GitHub Integration with Cloudflare Pages

This guide shows how to set up automatic deployments from GitHub to Cloudflare Pages.

## Benefits of GitHub Integration

- ✅ Automatic deployments on every push
- ✅ Preview deployments for pull requests
- ✅ Build logs in Cloudflare Dashboard
- ✅ No need to run `wrangler deploy` locally
- ✅ Environment variables managed in Cloudflare

## Setup Instructions

### 1. Connect GitHub Repository to Cloudflare Pages

1. Go to [Cloudflare Dashboard → Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Click on the **reforger-hotas-prod** project
3. Click on **Settings** tab
4. Scroll to **Builds & deployments** section
5. Click **Connect to Git**

### 2. Authorize GitHub

1. Click **Connect GitHub**
2. Authorize Cloudflare Pages to access your GitHub account
3. Select the repository: `jscrobinson/reforger_hotas_config`
4. Click **Install & Authorize**

### 3. Configure Build Settings

Set these build configuration values:

| Setting | Value |
|---------|-------|
| **Framework preset** | Vite |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (leave empty) |
| **Node version** | `20` |

### 4. Production Branch

- **Production branch**: `main`
- Every push to `main` → Production deployment
- Other branches → Preview deployments

### 5. Environment Variables (if needed)

If you need build-time environment variables:
1. Go to **Settings → Environment variables**
2. Add variables for Production/Preview environments

## How It Works

### Production Deployments

```
git push origin main
    ↓
GitHub webhook triggers Cloudflare
    ↓
Cloudflare runs: npm install && npm run build
    ↓
Deploys dist/ to https://reforger-hotas-prod.pages.dev
    ↓
Updates custom domain: https://hotas.deltafarce.win
```

### Preview Deployments

```
git push origin feature-branch
    ↓
Creates preview deployment
    ↓
Available at: https://<commit-hash>.reforger-hotas-prod.pages.dev
```

## Deployment Status

- ✅ View build logs in Cloudflare Dashboard
- ✅ See deployment history
- ✅ Rollback to previous versions
- ✅ Download deployment assets

## GitHub Commit Status Checks

Cloudflare will automatically add commit status checks to your PRs:
- ✅ **Build successful** - Green checkmark
- ❌ **Build failed** - Red X with error logs

## Custom Domain Configuration

After connecting GitHub, add custom domain:

1. In project settings, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `hotas.deltafarce.win`
4. Cloudflare will configure DNS automatically (if domain is on Cloudflare)

## Removing Local Deployment Scripts (Optional)

Once GitHub integration is set up, you can remove these npm scripts:

```json
{
  "scripts": {
    "pages:deploy": "...",      // ← Can remove
    "pages:deploy:prod": "..."   // ← Can remove
  }
}
```

Keep these:
```json
{
  "scripts": {
    "dev": "vite",               // ← Keep for local development
    "build": "vue-tsc && vite build",  // ← Keep (used by Cloudflare)
    "preview": "vite preview"    // ← Keep for local preview
  }
}
```

## Troubleshooting

### Build Fails with "Command not found"

Make sure build command is exactly: `npm run build`

### Build Succeeds but Site Doesn't Work

Check that **Build output directory** is set to `dist`

### Changes Not Deploying

1. Check the **Deployments** tab for build status
2. Review build logs for errors
3. Verify the correct branch is set as production

## Testing the Setup

1. Make a small change to `README.md`
2. Commit and push:
   ```bash
   git add README.md
   git commit -m "Test CI/CD"
   git push origin main
   ```
3. Watch the deployment in Cloudflare Dashboard
4. Check the live site after deployment completes

## Deployment Notifications

To get notifications:
1. Go to **Account → Notifications**
2. Enable **Pages Deploy Succeeded** and **Pages Deploy Failed**
3. Choose notification method (Email, Webhook, PagerDuty)

## Rollback to Previous Version

1. Go to **Deployments** tab
2. Find the deployment you want to rollback to
3. Click **⋮** → **Rollback to this deployment**
4. Confirm rollback

---

## Alternative: GitHub Actions (Advanced)

If you need more control over the build process, you can use GitHub Actions instead:

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
    permissions:
      contents: read
      deployments: write
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

      - name: Publish to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: reforger-hotas-prod
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

**Required Secrets:**
- `CLOUDFLARE_API_TOKEN`: Create at https://dash.cloudflare.com/profile/api-tokens
- `CLOUDFLARE_ACCOUNT_ID`: Found in dashboard URL

---

**Recommendation:** Use the native Cloudflare Pages Git integration (first method). It's simpler and officially supported.
