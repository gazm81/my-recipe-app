#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load recipes data
const recipes = require('./data/recipes.json');

// Create docs directory if it doesn't exist
const docsDir = path.join(__dirname, 'docs');
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}

// Create CSS directory in docs
const cssDir = path.join(docsDir, 'css');
if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
}

// Simple CSS for the static site
const css = `
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    line-height: 1.6;
    color: #333;
    background-color: #f9f9f9;
}

.header {
    text-align: center;
    margin-bottom: 40px;
    padding: 30px 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.header h1 {
    margin: 0;
    font-size: 2.5em;
    font-weight: 300;
}

.header p {
    margin: 10px 0 0 0;
    opacity: 0.9;
    font-size: 1.1em;
}

.recipes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 25px;
    margin-top: 30px;
}

.recipe-card {
    background: white;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid #e1e5e9;
}

.recipe-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.recipe-card h2 {
    margin: 0 0 15px 0;
    color: #2c3e50;
    font-size: 1.4em;
}

.recipe-card h2 a {
    text-decoration: none;
    color: inherit;
}

.recipe-meta {
    display: flex;
    gap: 15px;
    margin: 15px 0;
    font-size: 0.9em;
    color: #666;
}

.recipe-meta span {
    background: #f1f3f4;
    padding: 4px 8px;
    border-radius: 4px;
}

.recipe-preview {
    color: #666;
    margin: 15px 0;
}

.btn {
    display: inline-block;
    padding: 10px 20px;
    background: #667eea;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    transition: background 0.2s ease;
    font-weight: 500;
}

.btn:hover {
    background: #5a6fd8;
}

/* Recipe detail page styles */
.recipe-detail {
    background: white;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    margin: 20px 0;
}

.recipe-title {
    color: #2c3e50;
    margin-bottom: 20px;
    font-size: 2.2em;
    font-weight: 400;
}

.recipe-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
    margin: 25px 0;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
}

.recipe-info div {
    text-align: center;
}

.recipe-info strong {
    display: block;
    color: #667eea;
    font-size: 0.9em;
    margin-bottom: 5px;
}

.section {
    margin: 30px 0;
}

.section h3 {
    color: #2c3e50;
    border-bottom: 2px solid #667eea;
    padding-bottom: 8px;
    margin-bottom: 20px;
}

.ingredients {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 10px;
}

.ingredients li {
    background: #f8f9fa;
    padding: 8px 12px;
    border-radius: 4px;
    border-left: 3px solid #667eea;
}

.method li {
    margin: 15px 0;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 6px;
    position: relative;
    padding-left: 45px;
}

.method li:before {
    content: counter(step-counter);
    counter-increment: step-counter;
    position: absolute;
    left: 15px;
    top: 15px;
    background: #667eea;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8em;
    font-weight: bold;
}

.method ol {
    counter-reset: step-counter;
}

.timing {
    background: #e8f4fd;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #667eea;
}

.drinks {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.drinks li {
    background: #667eea;
    color: white;
    padding: 8px 15px;
    border-radius: 20px;
    list-style: none;
    font-size: 0.9em;
}

.back-link {
    margin: 20px 0;
}

.footer {
    text-align: center;
    margin-top: 60px;
    padding: 30px 0;
    color: #666;
    border-top: 1px solid #e1e5e9;
}

@media (max-width: 768px) {
    body {
        padding: 10px;
    }
    
    .recipe-detail {
        padding: 20px;
    }
    
    .header h1 {
        font-size: 2em;
    }
    
    .recipe-info {
        grid-template-columns: 1fr 1fr;
    }
}
`;

// Write CSS file
fs.writeFileSync(path.join(cssDir, 'style.css'), css);

// Generate index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Recipe Collection</title>
    <link rel="stylesheet" href="css/style.css">
    <meta name="description" content="A collection of delicious recipes including Hungarian Goulash, Chicken Corn Soup, and more.">
</head>
<body>
    <div class="header">
        <h1>🍽️ My Recipe Collection</h1>
        <p>A delicious collection of tried and tested recipes</p>
    </div>

    <div class="recipes-grid">
        ${recipes.map(recipe => `
            <div class="recipe-card">
                <h2><a href="recipe-${recipe.id}.html">${recipe.title}</a></h2>
                <div class="recipe-meta">
                    ${recipe.serves ? `<span>👥 Serves ${recipe.serves}</span>` : ''}
                    ${recipe.prepTime ? `<span>⏱️ Prep ${recipe.prepTime}</span>` : ''}
                    ${recipe.cookTime ? `<span>🔥 Cook ${recipe.cookTime}</span>` : ''}
                </div>
                <div class="recipe-preview">
                    ${recipe.ingredients.slice(0, 3).join(', ')}${recipe.ingredients.length > 3 ? '...' : ''}
                </div>
                <a href="recipe-${recipe.id}.html" class="btn">View Recipe</a>
            </div>
        `).join('')}
    </div>

    <div class="footer">
        <p>Generated from recipes.json | ${recipes.length} recipes available</p>
        <p><a href="https://github.com/gazm81/my-recipe-app" style="color: #667eea;">View Source on GitHub</a></p>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(docsDir, 'index.html'), indexHtml);

// Generate individual recipe pages
recipes.forEach(recipe => {
    const recipeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${recipe.title} - My Recipe Collection</title>
    <link rel="stylesheet" href="css/style.css">
    <meta name="description" content="${recipe.title} - A delicious recipe with ${recipe.ingredients.length} ingredients.">
</head>
<body>
    <div class="header">
        <h1>🍽️ My Recipe Collection</h1>
        <p><a href="index.html" style="color: white; text-decoration: none;">← Back to All Recipes</a></p>
    </div>

    <div class="recipe-detail">
        <h1 class="recipe-title">${recipe.title}</h1>
        
        <div class="recipe-info">
            ${recipe.serves ? `<div><strong>Serves</strong>${recipe.serves}</div>` : ''}
            ${recipe.prepTime ? `<div><strong>Prep Time</strong>${recipe.prepTime}</div>` : ''}
            ${recipe.cookTime ? `<div><strong>Cook Time</strong>${recipe.cookTime}</div>` : ''}
            ${recipe.source ? `<div><strong>Source</strong>${recipe.source}</div>` : ''}
        </div>

        <div class="section">
            <h3>🛒 Ingredients</h3>
            <ul class="ingredients">
                ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
        </div>

        <div class="section">
            <h3>👨‍🍳 Method</h3>
            <ol class="method">
                ${recipe.method.map(step => `<li>${step}</li>`).join('')}
            </ol>
        </div>

        ${recipe.timing ? `
        <div class="section">
            <h3>⏰ Timing</h3>
            <div class="timing">
                ${recipe.timing}
            </div>
        </div>
        ` : ''}

        ${recipe.recommendedDrinks && recipe.recommendedDrinks.length > 0 ? `
        <div class="section">
            <h3>🥂 Recommended Drinks</h3>
            <ul class="drinks">
                ${recipe.recommendedDrinks.map(drink => `<li>${drink}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
    </div>

    <div class="back-link">
        <a href="index.html" class="btn">← Back to All Recipes</a>
    </div>

    <div class="footer">
        <p><a href="https://github.com/gazm81/my-recipe-app" style="color: #667eea;">View Source on GitHub</a></p>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(docsDir, `recipe-${recipe.id}.html`), recipeHtml);
});

console.log(`✅ Static site generated successfully!`);
console.log(`📁 Generated ${recipes.length} recipe pages + index page`);
console.log(`📂 Output directory: ${docsDir}`);
console.log(`🌐 Files created:`);
console.log(`   - index.html`);
console.log(`   - css/style.css`);
recipes.forEach(recipe => {
    console.log(`   - recipe-${recipe.id}.html`);
});