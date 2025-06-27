#!/bin/bash

# Setup script for GitHub Actions Azure deployment
# This script helps set up the necessary Azure resources and GitHub secrets
# for the automated deployment pipeline

set -e

echo "🚀 Setting up Azure resources and GitHub Actions secrets..."
echo "=================================================="

# Configuration - these should match your deployment preferences
RESOURCE_GROUP="recipe-app-rg"
LOCATION="australiaeast"
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
# Set USE_DATE_SUFFIX=true to add date suffix for globally unique names
USE_DATE_SUFFIX=${USE_DATE_SUFFIX:-true}  # Default to true for setup to ensure uniqueness
DATE_SUFFIX=$(date +%s)

if [ "$USE_DATE_SUFFIX" = "true" ]; then
    ACR_NAME="myrecipeappacr$DATE_SUFFIX"
    STORAGE_ACCOUNT="myrecipeappstorage$(echo $DATE_SUFFIX | cut -c6-)"
else
    ACR_NAME="myrecipeappacr"
    STORAGE_ACCOUNT="myrecipeappstorage"
fi

FILE_SHARE_NAME="recipe-data"
SP_NAME="recipe-app-github-actions"

echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo "Subscription: $SUBSCRIPTION_ID"
echo "ACR Name: $ACR_NAME"
echo "Storage Account: $STORAGE_ACCOUNT"
echo "Use Date Suffix: $USE_DATE_SUFFIX"
echo ""

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

# Create resource group if it doesn't exist
echo "📁 Creating resource group..."
az group create \
    --name "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --output table

# Create Azure Container Registry
echo "🐳 Creating Azure Container Registry..."
az acr create \
    --name "$ACR_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --sku Basic \
    --admin-enabled true \
    --output table

# Create storage account and file share for persistent data
echo "💾 Creating storage account and file share..."
az storage account create \
    --name "$STORAGE_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --sku Standard_LRS \
    --kind StorageV2 \
    --output table

STORAGE_KEY=$(az storage account keys list --resource-group "$RESOURCE_GROUP" --account-name "$STORAGE_ACCOUNT" --query '[0].value' -o tsv)

az storage share create \
    --name "$FILE_SHARE_NAME" \
    --account-name "$STORAGE_ACCOUNT" \
    --account-key "$STORAGE_KEY" \
    --quota 5 \
    --output table

# Create service principal for GitHub Actions
echo "🔐 Creating service principal for GitHub Actions..."
SP_JSON=$(az ad sp create-for-rbac \
    --name "$SP_NAME" \
    --role contributor \
    --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP \
    --sdk-auth)

echo ""
echo "🎯 Setup completed successfully!"
echo "=================================================="
echo ""
echo "📋 GitHub Secrets to Configure:"
echo "================================"
echo ""
echo "In your GitHub repository, go to Settings > Secrets and variables > Actions"
echo "and add the following secrets:"
echo ""
echo "AZURE_CREDENTIALS:"
echo "$SP_JSON"
echo ""
echo "ACR_NAME:"
echo "$ACR_NAME"
echo ""
echo "STORAGE_ACCOUNT:"
echo "$STORAGE_ACCOUNT"
echo ""
echo "💡 Important Notes:"
echo "==================="
echo "1. Copy the AZURE_CREDENTIALS JSON above to your GitHub repository secrets"
echo "2. Copy the ACR_NAME and STORAGE_ACCOUNT values to your GitHub repository secrets"
echo "3. The first deployment will create the container instance"
echo "4. Subsequent deployments will update the existing container with new images"
echo "5. Persistent data in the Azure File Share will be preserved across deployments"
echo ""
echo "🚀 Once secrets are configured, push to main branch to trigger deployment!"
echo "=================================================="