const express = require('express');
const path = require('path');
const fs = require('fs');
const recipes = require('./data/recipes.json');

const app = express();
const PORT = process.env.PORT || 3000;

// File path for persistent runtime recipes (will be on Azure File Share)
const RUNTIME_RECIPES_FILE = path.join(__dirname, 'persistent-data', 'runtime-recipes.json');

// Load runtime recipes from file or initialize empty array
let runtimeRecipes = [];
try {
    if (fs.existsSync(RUNTIME_RECIPES_FILE)) {
        const data = fs.readFileSync(RUNTIME_RECIPES_FILE, 'utf8');
        runtimeRecipes = JSON.parse(data);
        console.log(`Loaded ${runtimeRecipes.length} runtime recipes from persistent storage`);
    }
} catch (error) {
    console.log('No existing runtime recipes found, starting with empty array');
    runtimeRecipes = [];
}

// Function to save runtime recipes to file
function saveRuntimeRecipes() {
    try {
        // Ensure the persistent-data directory exists
        const persistentDataDir = path.join(__dirname, 'persistent-data');
        if (!fs.existsSync(persistentDataDir)) {
            fs.mkdirSync(persistentDataDir, { recursive: true });
        }
        
        fs.writeFileSync(RUNTIME_RECIPES_FILE, JSON.stringify(runtimeRecipes, null, 2));
        console.log(`Saved ${runtimeRecipes.length} runtime recipes to persistent storage`);
    } catch (error) {
        console.error('Error saving runtime recipes:', error);
    }
}

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    const allRecipes = [...recipes, ...runtimeRecipes];
    res.render('index', { recipes: allRecipes });
});

app.get('/recipe/:id', (req, res) => {
    const allRecipes = [...recipes, ...runtimeRecipes];
    const recipe = allRecipes.find(r => r.id === req.params.id);
    if (!recipe) {
        return res.status(404).render('error', { message: 'Recipe not found' });
    }
    res.render('recipe', { recipe });
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/add', (req, res) => {
    const { title, ingredients, method, timing, drinks } = req.body;
    
    const newRecipe = {
        id: `runtime-${Date.now()}`,
        title: title || 'Untitled Recipe',
        ingredients: ingredients ? ingredients.split('\n').filter(i => i.trim()) : [],
        method: method ? method.split('\n').filter(m => m.trim()) : [],
        timing: timing || '',
        recommendedDrinks: drinks ? drinks.split('\n').filter(d => d.trim()) : [],
        prepTime: '',
        cookTime: '',
        serves: '',
        source: 'user-added'
    };
    
    runtimeRecipes.push(newRecipe);
    saveRuntimeRecipes();
    res.redirect('/');
});

// Edit recipe routes
app.get('/edit/:id', (req, res) => {
    const recipe = runtimeRecipes.find(r => r.id === req.params.id);
    if (!recipe) {
        return res.status(404).render('error', { message: 'Recipe not found or cannot be edited' });
    }
    res.render('edit', { recipe });
});

app.post('/edit/:id', (req, res) => {
    const { title, ingredients, method, timing, drinks } = req.body;
    const recipeIndex = runtimeRecipes.findIndex(r => r.id === req.params.id);
    
    if (recipeIndex === -1) {
        return res.status(404).render('error', { message: 'Recipe not found or cannot be edited' });
    }
    
    // Update the recipe
    runtimeRecipes[recipeIndex] = {
        ...runtimeRecipes[recipeIndex],
        title: title || 'Untitled Recipe',
        ingredients: ingredients ? ingredients.split('\n').filter(i => i.trim()) : [],
        method: method ? method.split('\n').filter(m => m.trim()) : [],
        timing: timing || '',
        recommendedDrinks: drinks ? drinks.split('\n').filter(d => d.trim()) : []
    };
    
    saveRuntimeRecipes();
    res.redirect(`/recipe/${req.params.id}`);
});

// Delete recipe route
app.post('/delete/:id', (req, res) => {
    const recipeIndex = runtimeRecipes.findIndex(r => r.id === req.params.id);
    
    if (recipeIndex === -1) {
        return res.status(404).render('error', { message: 'Recipe not found or cannot be deleted' });
    }
    
    // Remove the recipe from runtime recipes
    runtimeRecipes.splice(recipeIndex, 1);
    saveRuntimeRecipes();
    res.redirect('/');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Recipe app running on http://0.0.0.0:${PORT}`);
});