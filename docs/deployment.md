# Deployment Guide — Eureka Dev Tools

## 1. Target Environment

- **Production URL**: `https://tools.eurekagroup.id`
- **Hosting Platform**: GitHub Pages (Static SPA)
- **Custom Domain**: Configured via `public/CNAME` pointing to `tools.eurekagroup.id`

---

## 2. GitHub Actions CI/CD Pipeline

The project includes an automated deployment workflow at `.github/workflows/deploy.yml`.

### Deployment Pipeline Stages:

1. **Trigger**: Pushes to `main` branch.
2. **Checkout**: Checks out source code.
3. **Setup Node**: Uses Node.js 20 with npm cache.
4. **Install Dependencies**: `npm ci`
5. **Lint**: `npm run lint` (fails build if lint errors occur)
6. **Test**: `npm run test` (executes all Vitest suites)
7. **Build**: `npm run build`
8. **SPA 404 Fallback**: Copies `dist/index.html` to `dist/404.html` so that deep paths (e.g. `/tools/json-formatter`) work seamlessly on GitHub Pages.
9. **Deploy**: Deploys the `dist/` directory to GitHub Pages.

---

## 3. DNS Configuration for `tools.eurekagroup.id`

In Eureka Group's DNS provider (e.g., Cloudflare, Route53, or registrar):

- **Type**: CNAME
- **Name**: `tools`
- **Target**: `<organization>.github.io` (or your GitHub Pages host)
- **Proxy Status**: DNS only (or proxied with Full SSL)
