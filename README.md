# My Recipe App 🍽️

A containerized web application for hosting and managing recipes. This app serves your favorite recipes through a clean web interface and allows you to add new recipes on the fly.

## Features

- 📱 **Responsive Web Interface**: Browse recipes on any device
- 🥘 **Structured Recipes**: Each recipe includes ingredients, method, timing planner, and recommended drinks
- ➕ **Add New Recipes**: Add recipes through the web interface (stored in memory)
- 🐳 **Containerized**: Easy deployment with Docker
- 📋 **Pre-loaded Recipes**: Comes with existing recipes from the repository

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
docker run -p 3000:80 my-recipe-app
```

## Azure Deployment

This app is designed to be deployed on Azure with persistent storage. The deployment includes:

- **Azure Container Registry (ACR)** for storing the container image
- **Azure Container Instances (ACI)** for running the container 24/7
- **Azure File Share** mounted at `/app/persistent-data` for persistent recipe storage
- **Australia East** region deployment for optimal performance

### Prerequisites

- Azure CLI installed and configured
- An active Azure subscription
- Docker installed locally

### Automated Deployment

Run the provided deployment script:

```bash
# Make the script executable
chmod +x azure-deploy.sh

# Deploy to Azure
./azure-deploy.sh
```

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
ACR_NAME="myrecipeappacr$(date +%s)"
STORAGE_ACCOUNT="recipestorage$(date +%s)"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create container registry
az acr create --name $ACR_NAME --resource-group $RESOURCE_GROUP --sku Basic

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
  --name recipe-app-container \
  --resource-group $RESOURCE_GROUP \
  --image $ACR_NAME.azurecr.io/my-recipe-app:latest \
  --os-type Linux \
  --registry-login-server $ACR_NAME.azurecr.io \
  --ports 80 \
  --dns-name-label recipe-app-$(date +%s) \
  --azure-file-volume-account-name $STORAGE_ACCOUNT \
  --azure-file-volume-account-key $STORAGE_KEY \
  --azure-file-volume-share-name recipe-data \
  --azure-file-volume-mount-path /app/persistent-data \
  --environment-variables PORT=80 NODE_ENV=production
```

### Cost Optimization

The deployment is optimized for minimal cost while maintaining 24/7 availability:
- **Basic SKU** for Container Registry (lowest cost tier)
- **0.5 CPU, 1GB RAM** for Container Instances (minimal resources)
- **Standard_LRS** storage (lowest redundancy, lowest cost)
- **Single region deployment** to avoid cross-region charges

### Persistent Storage

With Azure File Share mounted at `/app/persistent-data`, new recipes added through the web interface are now **persistent** and will survive container restarts. The app automatically saves and loads recipes from the mounted file share.

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
