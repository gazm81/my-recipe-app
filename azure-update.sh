#!/bin/bash

# Azure Recipe App Update Script
# This script updates an existing deployment with a new container image
# while preserving persistent storage and other resources

set -e

# Configuration - modify these values to match your existing deployment
RESOURCE_GROUP="recipe-app-rg"
LOCATION="australiaeast"
# Set USE_DATE_SUFFIX=true if your resources were created with date suffix
USE_DATE_SUFFIX=${USE_DATE_SUFFIX:-false}
DATE_SUFFIX=$(date +%s)

# Default predictable names (set environment variables to override)
ACR_NAME=${ACR_NAME:-"myrecipeappacr"}
STORAGE_ACCOUNT=${STORAGE_ACCOUNT:-"myrecipeappstorage"}
ACI_NAME="my-recipe-app-container"
DNS_NAME="my-recipe-app"
FILE_SHARE_NAME="recipe-data"
IMAGE_NAME="my-recipe-app"
IMAGE_TAG="latest"

echo "🔄 Updating Azure Recipe App Deployment..."
echo "=========================================="

# Check if Azure CLI is installed and user is logged in
if ! command -v az &> /dev/null; then
    echo "❌ Error: Azure CLI is not installed. Please install it first."
    exit 1
fi

if ! az account show &> /dev/null; then
    echo "❌ Error: Not logged in to Azure. Please run 'az login' first."
    exit 1
fi

echo "✅ Azure CLI check passed"

# Prompt for ACR name if not provided and not using default
if [ -z "$ACR_NAME" ] || [ "$ACR_NAME" = "myrecipeappacr" ]; then
    if [ -z "$ACR_NAME" ]; then
        echo -n "Enter your Azure Container Registry name (default: myrecipeappacr): "
        read user_input
        ACR_NAME=${user_input:-"myrecipeappacr"}
    fi
fi

# Prompt for Storage Account name if not provided and not using default
if [ -z "$STORAGE_ACCOUNT" ] || [ "$STORAGE_ACCOUNT" = "myrecipeappstorage" ]; then
    if [ -z "$STORAGE_ACCOUNT" ]; then
        echo -n "Enter your Storage Account name (default: myrecipeappstorage): "
        read user_input
        STORAGE_ACCOUNT=${user_input:-"myrecipeappstorage"}
    fi
fi

echo ""
echo "Resource Group: $RESOURCE_GROUP"
echo "ACR Name: $ACR_NAME"
echo "Storage Account: $STORAGE_ACCOUNT"
echo "Container Instance: $ACI_NAME"
echo "DNS Name: $DNS_NAME"
echo ""

# Verify resources exist
echo "🔍 Verifying existing resources..."
if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
    echo "❌ Error: Resource group '$RESOURCE_GROUP' does not exist."
    echo "Please run the initial deployment script first."
    exit 1
fi

if ! az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
    echo "❌ Error: Container registry '$ACR_NAME' does not exist."
    exit 1
fi

if ! az storage account show --name "$STORAGE_ACCOUNT" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
    echo "❌ Error: Storage account '$STORAGE_ACCOUNT' does not exist."
    exit 1
fi

echo "✅ All required resources found"

# Build and push new container image
echo "🐳 Building and pushing new container image..."
az acr build \
    --registry "$ACR_NAME" \
    --image "$IMAGE_NAME:$IMAGE_TAG" \
    --image "$IMAGE_NAME:$(git rev-parse --short HEAD 2>/dev/null || date +%s)" \
    . \
    --output table

# Get necessary credentials and information
echo "🔐 Getting credentials..."
ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query loginServer -o tsv)
ACR_USERNAME=$(az acr credential show --name "$ACR_NAME" --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --query passwords[0].value -o tsv)
STORAGE_KEY=$(az storage account keys list --resource-group "$RESOURCE_GROUP" --account-name "$STORAGE_ACCOUNT" --query '[0].value' -o tsv)

# Stop and delete existing container instance
echo "🛑 Stopping existing container instance..."
az container delete \
    --name "$ACI_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --yes \
    || echo "ℹ️  Container instance not found or already deleted"

# Deploy updated container instance
echo "🚀 Deploying updated container..."
az container create \
    --name "$ACI_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --image "$ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG" \
    --os-type Linux \
    --registry-login-server "$ACR_LOGIN_SERVER" \
    --registry-username "$ACR_USERNAME" \
    --registry-password "$ACR_PASSWORD" \
    --dns-name-label "$DNS_NAME" \
    --ports 3000 \
    --protocol TCP \
    --cpu 0.5 \
    --memory 1 \
    --restart-policy Always \
    --azure-file-volume-account-name "$STORAGE_ACCOUNT" \
    --azure-file-volume-account-key "$STORAGE_KEY" \
    --azure-file-volume-share-name "$FILE_SHARE_NAME" \
    --azure-file-volume-mount-path "/app/persistent-data" \
    --environment-variables "NODE_ENV=production" "CALLBACK_URL=http://$DNS_NAME.$LOCATION.azurecontainer.io:3000/auth/github/callback" \
    --output table

# Get the new deployment URL
FQDN=$(az container show --name "$ACI_NAME" --resource-group "$RESOURCE_GROUP" --query ipAddress.fqdn -o tsv)

echo ""
echo "🎉 Update completed successfully!"
echo "================================="
echo "Application URL: http://$FQDN:3000"
echo "Container Image: $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG"
echo "Persistent storage preserved: ✅"
echo ""
echo "💡 Your app is now running with the latest code changes!"
echo "All persistent data from the Azure File Share has been preserved."
echo ""