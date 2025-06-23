# My Recipe App 🍽️

A containerized web application for hosting and managing recipes. This app serves your favorite recipes through a clean web interface and allows you to add new recipes on the fly.

## Features

- 📱 **Responsive Web Interface**: Browse recipes on any device
- 🥘 **Structured Recipes**: Each recipe includes ingredients, method, timing planner, and recommended drinks
- ➕ **Add New Recipes**: Add recipes through the web interface (stored in memory)
- 🐳 **Containerized**: Easy deployment with Docker
- 📋 **Pre-loaded Recipes**: Comes with existing recipes from the repository

## Quick Start

### Local Development (Recommended for now)

```bash
# Install dependencies
npm install

# Start the application
npm start
```

Then open your browser and navigate to `http://localhost:3000`

### Using Docker Compose

⚠️ **Note**: There is currently an issue with the Docker container setup that is being investigated. Please use the local development method above for now.

1. Clone the repository:
```bash
git clone <repository-url>
cd my-recipe-app
```

2. Start the application:
```bash
docker-compose up -d
```

3. Open your browser and navigate to `http://localhost:3000`

### Using Docker

```bash
# Build the image
docker build -t my-recipe-app .

# Run the container
docker run -p 3000:3000 my-recipe-app
```

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

**Note**: New recipes added through the web interface are stored in memory only and will be lost when the container restarts. This is by design as specified in the requirements.

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
