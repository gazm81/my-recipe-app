# GitHub Pages Setup Instructions

## Enabling GitHub Pages

To enable the GitHub Pages site for this repository:

1. **Go to Repository Settings**
   - Navigate to your repository on GitHub
   - Click on the "Settings" tab
   - Scroll down to the "Pages" section in the left sidebar

2. **Configure Source**
   - Under "Source", select "GitHub Actions"
   - This will enable the workflow in `.github/workflows/github-pages.yml`

3. **Repository Permissions** 
   - Ensure the repository has "Read and write permissions" for Actions
   - Go to Settings → Actions → General → Workflow permissions
   - Select "Read and write permissions"

## Automatic Deployment

Once enabled, the site will automatically deploy when:
- `data/recipes.json` is updated
- `generate-static-site.js` is modified  
- The GitHub Pages workflow file is changed
- You can also trigger manually from the Actions tab

## Site URL

Your site will be available at:
`https://gazm81.github.io/my-recipe-app/`

## Manual Build

To test locally:
```bash
npm run build:static
cd docs && python3 -m http.server 8080
```

## Troubleshooting

If the deployment fails:
1. Check the Actions tab for error logs
2. Ensure GitHub Pages is enabled in Settings
3. Verify the docs/ folder contains the generated files
4. Make sure the workflow has proper permissions

## Recent Updates

**2024**: Updated GitHub Actions to latest versions to fix deprecated action warnings:
- `actions/setup-node@v3` → `v4`
- `actions/configure-pages@v3` → `v5`  
- `actions/upload-pages-artifact@v2` → `v3`
- `actions/deploy-pages@v2` → `v4`

This resolved the "deprecated version of actions/upload-artifact: v3" error.