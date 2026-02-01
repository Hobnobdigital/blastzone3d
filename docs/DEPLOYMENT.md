# Deployment Guide 🚀

Complete guide for local development, building, and deploying BlastZone3D.

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**
- Modern browser (Chrome, Firefox, Safari, Edge)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Hobnobdigital/blastzone3d.git
cd blastzone3d
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The game will be available at `http://localhost:5173`

### 4. Development Workflow

- **Hot reload:** Changes to source files automatically refresh the browser
- **TypeScript:** Type errors show in terminal and browser console
- **Asset loading:** Place assets in `/assets` and import them in your code

## Build Commands

### Development Build

```bash
npm run dev
```
- Fast compilation
- Source maps enabled
- Hot module replacement (HMR)

### Production Build

```bash
npm run build
```
- Optimized bundle size
- Minified code
- Tree-shaking applied
- Assets hashed for caching

### Preview Production Build

```bash
npm run preview
```
Test the production build locally before deploying.

### Type Checking

```bash
npm run type-check
```
Runs TypeScript compiler in check mode (no output files).

### Linting

```bash
npm run lint
```
Checks code style and catches common errors.

### Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:ui
```

## Deployment Process

### Automatic Deployment (Vercel)

**Main Branch → Production**
- Push to `main` branch triggers automatic production deployment
- URL: `https://blastzone3d.vercel.app`
- Runs build checks before deploying
- Rollback available in Vercel dashboard

**Pull Requests → Preview**
- Each PR gets a unique preview URL
- Automatic preview deployment on every commit
- Perfect for testing features before merge

### Manual Deployment

#### Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Via GitHub Actions

Deployments are automatic when pushing to:
- `main` → Production
- Any PR → Preview environment

## Environment Variables

Create a `.env.local` file for local development:

```env
# Example environment variables (update as needed)
VITE_API_URL=https://api.example.com
VITE_ENABLE_MULTIPLAYER=true
VITE_DEBUG_MODE=false
```

### Setting Production Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add variables for **Production**, **Preview**, or **Development**

**Important:** Prefix all client-side variables with `VITE_` to expose them to the browser.

## Performance Optimization

### Build Optimization

The production build automatically:
- ✓ Minifies JavaScript/CSS
- ✓ Optimizes images
- ✓ Generates service worker for caching
- ✓ Code-splits for faster initial load
- ✓ Tree-shakes unused code

### Asset Loading

- Use dynamic imports for large assets
- Implement progressive loading for 3D models
- Lazy-load audio files
- Use texture atlases to reduce draw calls

### Monitoring

**Vercel Analytics** (built-in):
- Page load times
- Core Web Vitals
- Real user monitoring

**Custom Metrics:**
```typescript
// Track FPS in-game
performance.mark('frame-start');
// ... render frame ...
performance.mark('frame-end');
performance.measure('frame-time', 'frame-start', 'frame-end');
```

## Troubleshooting

### Build Fails

**TypeScript errors:**
```bash
npm run type-check
```
Fix all type errors before building.

**Dependency issues:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Vercel Deployment Fails

1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Verify `vercel.json` configuration
4. Check Node.js version matches `engines` in `package.json`

### Performance Issues

1. Run Lighthouse audit
2. Check bundle size: `npm run build` shows gzipped sizes
3. Use Chrome DevTools Performance tab
4. Enable production mode for Three.js

## CI/CD Pipeline

### GitHub Actions Workflow

Located at `.github/workflows/ci.yml`:

**On Pull Request:**
- ✓ Lint check
- ✓ Type check
- ✓ Unit tests
- ✓ Build verification
- ✓ Asset validation

**On Push to Main:**
- ✓ All PR checks
- ✓ Deploy to production
- ✓ Tag release

### Branch Protection

**Main branch requires:**
- At least 1 approval
- All CI checks passing
- Up-to-date with base branch

## Asset Pipeline

### Generated Assets

Assets created with AI tools are tracked in `/assets/generated/`:

```
/assets/generated/
  metadata.json       # Prompts, settings, versions
  icons/
  textures/
  models/
  audio/
```

### Asset Metadata Format

```json
{
  "asset_id": "power-up-speed-icon",
  "type": "icon",
  "prompt": "Futuristic speed boost icon, glowing blue, minimal...",
  "tool": "midjourney-v6",
  "seed": 12345,
  "timestamp": "2026-02-01T04:00:00Z",
  "version": "1.0",
  "license": "CC0"
}
```

## Rollback Procedure

### Vercel Rollback

1. Go to Vercel dashboard
2. Select **Deployments**
3. Find previous working deployment
4. Click **⋮** → **Promote to Production**

### Git Rollback

```bash
# Find commit to rollback to
git log --oneline

# Create revert commit
git revert <commit-hash>

# Or hard reset (use with caution)
git reset --hard <commit-hash>
git push --force
```

## Support

- **Issues:** [GitHub Issues](https://github.com/Hobnobdigital/blastzone3d/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Hobnobdigital/blastzone3d/discussions)
- **Documentation:** `/docs` folder

---

**Last Updated:** 2026-02-01  
**Maintained by:** DevOps Team
