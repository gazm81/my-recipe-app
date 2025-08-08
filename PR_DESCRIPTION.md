# Add New Recipes: Mum's Lasagne and Pork Carnitas

## Summary

This PR adds two new delicious recipes to the recipe collection:

1. **Mum's Lasagne** - A traditional family recipe with rich meat sauce and creamy white sauce
2. **Pork Carnitas** - Modern pressure cooker and air fryer method for crispy, flavorful carnitas

## Changes Made

- Added 2 new recipes to `data/recipes.json`
- Both recipes follow the existing JSON structure and formatting standards
- Includes complete ingredient lists, step-by-step methods, timing information, and recommended drink pairings

## Recipe Details

### Mum's Lasagne

- **Serves**: 4 people
- **Total Time**: ~1 hour 20 minutes
- **Features**: Traditional meat sauce with carrots, white sauce with nutmeg, San Remo lasagne sheets
- **Source**: Family recipe

### Pork Carnitas (2kg)

- **Serves**: 8-10 people  
- **Total Time**: ~1 hour 25 minutes
- **Features**: Pressure cooker for tenderness + air fryer for crispy edges
- **Source**: Original recipe

## Quality Assurance

- ✅ JSON syntax validated
- ✅ Consistent formatting with existing recipes
- ✅ All required fields included (id, title, serves, prepTime, cookTime, ingredients, method, timing, recommendedDrinks, source)
- ✅ Unique recipe IDs assigned
- ✅ Detailed cooking instructions provided

## Testing

- [ ] Verify JSON file loads correctly in the application
- [ ] Check recipe display formatting in UI
- [ ] Validate all recipe fields render properly

## Impact

- Expands recipe collection with 2 popular meal options
- Maintains data structure consistency
- No breaking changes to existing functionality
