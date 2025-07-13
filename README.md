# My Recipe App 🍽️

A containerized web application for hosting and managing recipes. This app serves your favorite recipes through a clean web interface and allows you to add new recipes on the fly.

## Features

- 📱 **Responsive Web Interface**: Browse recipes on any device
- 🥘 **Structured Recipes**: Each recipe includes ingredients, method, timing planner, and recommended drinks
- ➕ **Add New Recipes**: Add recipes through the web interface (stored in memory)
- 🐳 **Containerized**: Easy deployment with Docker
- 📋 **Pre-loaded Recipes**: Comes with existing recipes from the repository
- 🔐 **GitHub Authentication**: Secure access with GitHub OAuth
- 🌐 **GitHub Pages**: Public static site automatically generated from recipes.json

## GitHub Pages Static Site

In addition to the full-featured Azure deployment, this repository automatically generates a **public GitHub Pages site** that displays all recipes from `data/recipes.json`.

### How it Works

- **Static Site Generation**: A Node.js script (`generate-static-site.js`) reads recipes from `data/recipes.json` and generates HTML pages
- **Automatic Deployment**: GitHub Actions automatically builds and deploys the static site when recipes are updated
- **Public Access**: No authentication required - anyone can view the recipes

### Accessing the Static Site

The GitHub Pages site is automatically available at:
`https://gazm81.github.io/my-recipe-app/`

### Local Static Site Development

```bash
# Generate static site locally
npm run build:static

# Serve locally for testing
cd docs && python3 -m http.server 8080
# Visit http://localhost:8080
```

### Features of the Static Site

- 📱 **Responsive Design**: Works on all devices
- 🎨 **Clean UI**: Modern card-based layout
- 🔍 **Recipe Details**: Individual pages for each recipe
- 🏷️ **Metadata Display**: Prep time, cook time, serving size
- 📊 **Recipe Grid**: Easy browsing of all available recipes

The static site automatically updates whenever `data/recipes.json` is modified, ensuring the public site always reflects the latest recipe collection.

## Authentication

This app requires GitHub authentication to access any content. Users must sign in with their GitHub account to view, add, edit, or delete recipes.

### Setting up GitHub OAuth

To enable authentication, you need to create a GitHub OAuth App and configure the environment variables:

1. **Create a GitHub OAuth App:**
   - Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/applications/new)
   - Fill in the application details:
     - **Application name**: `My Recipe App` (or your preferred name)
     - **Homepage URL**: Your app's URL (e.g., `https://your-app.azurecontainer.io` or `http://localhost:3000` for local development)
     - **Authorization callback URL**: `http://my-recipe-app.australiaeast.azurecontainer.io/auth/github/callback` (or `http://localhost:3000/auth/github/callback` for local development)
   - Click **Register application**
   - Note the **Client ID** and generate a **Client Secret**

2. **Configure Environment Variables:**
   ```bash
   # Required for GitHub OAuth
   GH_CLIENT_ID=your_github_client_id
   GH_CLIENT_SECRET=your_github_client_secret
   
   # Optional - for session security (will use default if not provided)
   SESSION_SECRET=your-random-session-secret
   ```

   **Note:** The `CALLBACK_URL` is automatically configured for Azure deployments using the predictable FQDN format: `http://my-recipe-app.australiaeast.azurecontainer.io/auth/github/callback`

3. **For Azure Deployment:**
   Add the required environment variables (`GH_CLIENT_ID`, `GH_CLIENT_SECRET`, `SESSION_SECRET`) to your GitHub repository secrets. The `CALLBACK_URL` is automatically configured during deployment.

4. **For Local Development:**
   - Create a `.env` file in the project root with the above variables, or
   - Set them as environment variables in your shell before running `npm start`

**Note:** Without proper GitHub OAuth configuration, the app will show a configuration error page with setup instructions.

## Quick Start

### Using VS Code Dev Container (Recommended)

The easiest way to get started is using the VS Code development container:

**Requirements:**
- Docker Desktop installed and running
- VS Code with the Dev Containers extension

**Steps:**
1. Open the project in VS Code
2. When prompted, click "Reopen in Container" or use `F1` → "Dev Containers: Reopen in Container"
3. VS Code will build the container and install dependencies automatically
4. Run `npm start` in the VS Code terminal
5. Open `http://localhost:3000` in your browser

The dev container works on both **Windows and Mac** and provides a consistent development environment with all necessary tools pre-installed.

### Local Development (Alternative)

```bash
# Install dependencies
npm install

# Start the application
npm start
```

Then open your browser and navigate to `http://localhost:3000`

### Using Docker

```bash
# Build the image
docker build -t my-recipe-app .

# Run the container locally (for development)
docker run -p 3000:3000 my-recipe-app
```

## Azure Deployment

This app is designed to be deployed on Azure with persistent storage and automated CI/CD. The deployment includes:

- **Azure Container Registry (ACR)** for storing the container image
- **Azure Container Instances (ACI)** for running the container 24/7
- **Azure File Share** mounted at `/app/persistent-data` for persistent recipe storage
- **GitHub Actions** for automated deployment on code changes
- **Australia East** region deployment for optimal performance

### Automated CI/CD Pipeline 🚀

The repository includes a GitHub Actions workflow that automatically deploys your app when you push changes to the main branch.

#### Resource Naming Convention

This app uses **predictable, consistent resource names** for reliable deployments:

- **Container Registry**: `myrecipeappacr`
- **Storage Account**: `myrecipeappstorage`  
- **Container Instance**: `my-recipe-app-container`
- **DNS Name**: `my-recipe-app` (predictable URL: `my-recipe-app.australiaeast.azurecontainer.io`)

**Benefits:**
- 🎯 **Predictable URLs** - No more changing DNS names between deployments
- 🔄 **Reliable Callbacks** - OAuth and webhooks work consistently
- 📝 **Easy Management** - Simple to remember and reference resource names

**Note:** For globally unique resources (ACR and Storage), you can set `USE_DATE_SUFFIX=true` to add timestamps if the default names are already taken.

#### Setup CI/CD Pipeline

1. **Initial Azure Setup:**
   ```bash
   # Make the setup script executable
   chmod +x setup-github-actions.sh
   
   # Run the setup script (requires Azure CLI login)
   ./setup-github-actions.sh
   ```

2. **Configure GitHub Secrets:**
   The setup script will output the required GitHub secrets. In your GitHub repository:
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Add the following secrets:
     - `AZURE_CREDENTIALS` (JSON output from setup script)
     - `ACR_NAME` (your container registry name)
     - `STORAGE_ACCOUNT` (your storage account name)
     - `GH_CLIENT_ID` (your GitHub OAuth app client ID)
     - `GH_CLIENT_SECRET` (your GitHub OAuth app client secret)
     - `SESSION_SECRET` (optional, random string for session security)

   **Note:** The `CALLBACK_URL` is no longer required as a secret - it's automatically configured during deployment.

3. **Deploy Automatically:**
   - Push changes to the `main` branch
   - GitHub Actions will automatically build and deploy your app
   - Monitor progress in the **Actions** tab of your GitHub repository

#### How the CI/CD Pipeline Works

1. **Trigger**: Push to main branch or manual workflow dispatch
2. **Build**: Container image is built and pushed to Azure Container Registry
3. **Deploy**: Container instance is updated with the new image
4. **Preserve Data**: Persistent storage (Azure File Share) remains intact across deployments
5. **Verify**: Deployment URL is provided in the workflow output

### Manual Deployment Options

#### Initial Deployment

For the initial deployment or if you prefer manual deployment:

```bash
# Make the script executable
chmod +x azure-deploy.sh

# Deploy with predictable names (default)
./azure-deploy.sh

# OR deploy with date suffix for uniqueness
USE_DATE_SUFFIX=true ./azure-deploy.sh
```

#### Update Existing Deployment

To manually update an existing deployment with new code changes:

```bash
# Make the update script executable  
chmod +x azure-update.sh

# Update existing deployment (will prompt for resource names if needed)
./azure-update.sh

# OR set resource names as environment variables
ACR_NAME=myrecipeappacr STORAGE_ACCOUNT=myrecipeappstorage ./azure-update.sh
```

### Monitoring & Troubleshooting

#### GitHub Actions
- **Monitor deployments**: Check the **Actions** tab in your GitHub repository
- **View logs**: Click on any workflow run to see detailed deployment logs
- **Failed deployments**: Check the logs for specific error messages

#### Azure Container Monitoring
```bash
# Check container status
az container show --name my-recipe-app-container --resource-group recipe-app-rg

# View container logs
az container logs --name my-recipe-app-container --resource-group recipe-app-rg

# Follow live logs
az container logs --name my-recipe-app-container --resource-group recipe-app-rg --follow
```

#### Common Issues
- **First deployment fails**: Ensure GitHub secrets are correctly configured
- **Container won't start**: Check that ACR_NAME and STORAGE_ACCOUNT secrets match your actual resource names
- **Data not persisting**: Verify the Azure File Share is correctly mounted at `/app/persistent-data`

The script will:
1. Create a resource group and all necessary Azure resources
2. Build and push the container image to Azure Container Registry
3. Deploy the container to Azure Container Instances with persistent storage
4. Provide you with the public URL to access your deployed app

### Manual Deployment Steps

If you prefer to deploy manually:

1. **Create Azure Resources:**
```bash
# Set variables
RESOURCE_GROUP="recipe-app-rg"
LOCATION="australiaeast"
ACR_NAME="myrecipeappacr"  # Or add timestamp: myrecipeappacr$(date +%s)
STORAGE_ACCOUNT="myrecipeappstorage"  # Or add timestamp: myrecipeappstorage$(date +%s)

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create container registry  
az acr create --name $ACR_NAME --resource-group $RESOURCE_GROUP --sku Basic --admin-enabled true

# Create storage account and file share
az storage account create --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --location $LOCATION --sku Standard_LRS
STORAGE_KEY=$(az storage account keys list --resource-group $RESOURCE_GROUP --account-name $STORAGE_ACCOUNT --query '[0].value' -o tsv)
az storage share create --name recipe-data --account-name $STORAGE_ACCOUNT --account-key $STORAGE_KEY
```

2. **Build and Push Image:**
```bash
# Build and push to ACR
az acr build --registry $ACR_NAME --image my-recipe-app:latest .
```

3. **Deploy Container:**
```bash
# Deploy to ACI with persistent storage
az container create \
  --name my-recipe-app-container \
  --resource-group $RESOURCE_GROUP \
  --image $ACR_NAME.azurecr.io/my-recipe-app:latest \
  --os-type Linux \
  --registry-login-server $ACR_NAME.azurecr.io \
  --ports 3000 \
  --dns-name-label my-recipe-app \
  --azure-file-volume-account-name $STORAGE_ACCOUNT \
  --azure-file-volume-account-key $STORAGE_KEY \
  --azure-file-volume-share-name recipe-data \
  --azure-file-volume-mount-path /app/persistent-data \
  --environment-variables NODE_ENV=production
```

### Cost Optimization

The deployment is optimized for minimal cost while maintaining 24/7 availability:
- **Basic SKU** for Container Registry (lowest cost tier)
- **0.5 CPU, 1GB RAM** for Container Instances (minimal resources)
- **Standard_LRS** storage (lowest redundancy, lowest cost)
- **Single region deployment** to avoid cross-region charges

### Persistent Storage & CI/CD Data Preservation

With Azure File Share mounted at `/app/persistent-data`, new recipes added through the web interface are **persistent** and will survive:

- ✅ Container restarts
- ✅ Manual deployments  
- ✅ **Automated CI/CD deployments**
- ✅ Container instance updates

The CI/CD pipeline is specifically designed to preserve your data during deployments. When new code is pushed to main:

1. A new container image is built with your latest code
2. The existing container instance is replaced with the new image
3. **The Azure File Share remains attached** - no data is lost
4. Your app continues running with all existing recipes intact

This means you can continuously deploy code improvements while keeping all user-added recipes safe.

## Recipe Structure

Each recipe includes the following sections:
- **Ingredients**: List of all required ingredients
- **Method**: Step-by-step cooking instructions
- **Timing Planner**: Schedule for meal preparation
- **Recommended Drinks**: Suggested beverages to pair with the dish
- **Metadata**: Prep time, cook time, and serving size

## Adding New Recipes

1. Navigate to the "Add Recipe" page
2. Fill in the recipe details
3. Submit the form

**Note**: With Azure deployment and persistent storage, new recipes added through the web interface are now saved permanently to the Azure File Share and will persist across container restarts.

## Initial Recipes

The app comes pre-loaded with these recipes:
- Hungarian Goulash (Inspired by Mum's Version)
- Chicken, Corn & Pea Soup
- Split Pea & Ham Hock Soup

## API Endpoints

- `GET /` - Home page with all recipes
- `GET /recipe/:id` - Individual recipe view
- `GET /add` - Add recipe form
- `POST /add` - Submit new recipe

## Architecture

- **Backend**: Node.js with Express
- **Frontend**: EJS templates with responsive CSS
- **Data**: JSON file for initial recipes, in-memory storage for new recipes
- **Container**: Alpine Linux with Node.js 18

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## Contributing

Feel free to submit issues and enhancement requests!
