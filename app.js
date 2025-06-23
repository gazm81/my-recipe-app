const express = require('express');
const path = require('path');
const recipes = require('./data/recipes.json');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for new recipes
let runtimeRecipes = [];

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
    res.redirect('/');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Recipe app running on http://0.0.0.0:${PORT}`);
});