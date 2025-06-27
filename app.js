const express = require('express');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const recipes = require('./data/recipes.json');

const app = express();
const PORT = process.env.PORT || 3000;

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GH_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GH_CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL || `http://localhost:${PORT}/auth/github/callback`;

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

// Passport configuration
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// GitHub Strategy
if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: CALLBACK_URL
    }, (accessToken, refreshToken, profile, done) => {
        // For this simple app, we'll just pass the profile data
        return done(null, {
            id: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            email: profile.emails ? profile.emails[0].value : null,
            avatar: profile.photos ? profile.photos[0].value : null
        });
    }));
} else {
    console.warn('GitHub OAuth not configured. Set GH_CLIENT_ID and GH_CLIENT_SECRET environment variables.');
}

// Authentication middleware
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'recipe-app-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Disabled for production HTTP deployment - will be enabled when HTTPS is added
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Make user available in all templates
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Authentication routes
app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('login');
});

// Only add GitHub routes if OAuth is configured
if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
    app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

    app.get('/auth/github/callback', 
        passport.authenticate('github', { failureRedirect: '/login' }),
        (req, res) => {
            res.redirect('/');
        }
    );
}

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

// Routes
app.get('/', ensureAuthenticated, (req, res) => {
    const allRecipes = [...recipes, ...runtimeRecipes];
    res.render('index', { recipes: allRecipes });
});

app.get('/recipe/:id', ensureAuthenticated, (req, res) => {
    const allRecipes = [...recipes, ...runtimeRecipes];
    const recipe = allRecipes.find(r => r.id === req.params.id);
    if (!recipe) {
        return res.status(404).render('error', { message: 'Recipe not found' });
    }
    res.render('recipe', { recipe });
});

app.get('/add', ensureAuthenticated, (req, res) => {
    res.render('add');
});

app.post('/add', ensureAuthenticated, (req, res) => {
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
app.get('/edit/:id', ensureAuthenticated, (req, res) => {
    const recipe = runtimeRecipes.find(r => r.id === req.params.id);
    if (!recipe) {
        return res.status(404).render('error', { message: 'Recipe not found or cannot be edited' });
    }
    res.render('edit', { recipe });
});

app.post('/edit/:id', ensureAuthenticated, (req, res) => {
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
app.post('/delete/:id', ensureAuthenticated, (req, res) => {
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