#!/bin/bash

# Azure Recipe App Deployment Script
# This script creates all necessary Azure resources and deploys the containerized recipe app

set -e  # Exit on any error

# Configuration - modify these values as needed
RESOURCE_GROUP="recipe-app-rg"
LOCATION="australiaeast"
ACR_NAME="recipeappacr$(date +%s)"  # Must be globally unique
ACI_NAME="recipe-app-container"
STORAGE_ACCOUNT="recipeappstorage$(date +%s | cut -c6-)"  # Must be globally unique
FILE_SHARE_NAME="recipe-data"
IMAGE_NAME="my-recipe-app"
IMAGE_TAG="latest"

echo "Starting Azure Recipe App Deployment..."
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo "ACR Name: $ACR_NAME"
echo "Storage Account: $STORAGE_ACCOUNT"

# Check if Azure CLI is installed and user is logged in
if ! command -v az &> /dev/null; then
    echo "Error: Azure CLI is not installed. Please install it first."
    echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo "Error: Not logged in to Azure. Please run 'az login' first."
    exit 1
fi

echo "✓ Azure CLI check passed"

# Create resource group
echo "Creating resource group: $RESOURCE_GROUP"
az group create \
    --name "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --output table

# Create Azure Container Registry
echo "Creating Azure Container Registry: $ACR_NAME"
az acr create \
    --name "$ACR_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --sku Basic \
    --admin-enabled true \
    --output table

# Get ACR login server
ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query loginServer -o tsv)
echo "ACR Login Server: $ACR_LOGIN_SERVER"

# Create storage account for Azure File Share
echo "Creating storage account: $STORAGE_ACCOUNT"
az storage account create \
    --name "$STORAGE_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --sku Standard_LRS \
    --kind StorageV2 \
    --output table

# Get storage account key
STORAGE_KEY=$(az storage account keys list --resource-group "$RESOURCE_GROUP" --account-name "$STORAGE_ACCOUNT" --query '[0].value' -o tsv)

# Create file share
echo "Creating Azure File Share: $FILE_SHARE_NAME"
az storage share create \
    --name "$FILE_SHARE_NAME" \
    --account-name "$STORAGE_ACCOUNT" \
    --account-key "$STORAGE_KEY" \
    --quota 5 \
    --output table

# Build and push container image
echo "Building and pushing container image..."
echo "Note: Using Azure Container Registry build service to avoid local Docker environment issues"

# Create a minimal Dockerfile for Azure deployment
cat > Dockerfile.azure << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production && npm cache clean --force

# Copy application code
COPY . .

# Create data directory for persistent storage
RUN mkdir -p /app/data

EXPOSE 80

# Set default port to 80 for Azure deployment
ENV PORT=80

CMD ["npm", "start"]
EOF

az acr build \
    --registry "$ACR_NAME" \
    --image "$IMAGE_NAME:$IMAGE_TAG" \
    --file Dockerfile.azure \
    . \
    --output table

# Clean up the temporary Dockerfile
rm Dockerfile.azure

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name "$ACR_NAME" --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --query passwords[0].value -o tsv)

# Deploy container to Azure Container Instances
echo "Deploying to Azure Container Instances: $ACI_NAME"
az container create \
    --name "$ACI_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --image "$ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG" \
    --registry-login-server "$ACR_LOGIN_SERVER" \
    --registry-username "$ACR_USERNAME" \
    --registry-password "$ACR_PASSWORD" \
    --dns-name-label "$ACI_NAME-$(date +%s)" \
    --ports 80 \
    --protocol TCP \
    --cpu 0.5 \
    --memory 1 \
    --restart-policy Always \
    --azure-file-volume-account-name "$STORAGE_ACCOUNT" \
    --azure-file-volume-account-key "$STORAGE_KEY" \
    --azure-file-volume-share-name "$FILE_SHARE_NAME" \
    --azure-file-volume-mount-path "/app/data" \
    --environment-variables "PORT=80" "NODE_ENV=production" \
    --output table

# Get the FQDN of the deployed container
FQDN=$(az container show --name "$ACI_NAME" --resource-group "$RESOURCE_GROUP" --query ipAddress.fqdn -o tsv)

echo ""
echo "================================================"
echo "🎉 Deployment completed successfully!"
echo "================================================"
echo "Resource Group: $RESOURCE_GROUP"
echo "Container Registry: $ACR_NAME"
echo "Storage Account: $STORAGE_ACCOUNT"
echo "Container Instance: $ACI_NAME"
echo "Application URL: http://$FQDN"
echo ""
echo "The recipe app is now running on Azure with persistent storage!"
echo "New recipes added through the web interface will be saved to the Azure File Share."
echo ""
echo "To check status: az container show --name $ACI_NAME --resource-group $RESOURCE_GROUP"
echo "To view logs: az container logs --name $ACI_NAME --resource-group $RESOURCE_GROUP"
echo "To delete all resources: az group delete --name $RESOURCE_GROUP --yes --no-wait"
echo "================================================"