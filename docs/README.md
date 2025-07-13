# GitHub Pages Static Site

This directory contains the generated static website for GitHub Pages deployment.

## How it works

1. **Source**: The static site is generated from `data/recipes.json`
2. **Generator**: The `generate-static-site.js` script creates HTML pages
3. **Deployment**: GitHub Actions automatically builds and deploys on changes

## Files Generated

- `index.html` - Main page with recipe grid
- `recipe-{id}.html` - Individual recipe pages  
- `css/style.css` - Responsive stylesheet

## Local Development

To regenerate the static site locally:

```bash
npm run build:static
```

To serve locally for testing:

```bash
cd docs
python3 -m http.server 8080
# Visit http://localhost:8080
```

## Automatic Deployment

The static site is automatically regenerated and deployed when:
- `data/recipes.json` is updated
- `generate-static-site.js` is modified
- The GitHub Pages workflow is changed

The deployment happens via GitHub Actions and serves the site from this `docs/` folder.