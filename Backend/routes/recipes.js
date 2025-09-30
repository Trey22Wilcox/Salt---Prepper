import express from 'express';
import axios from 'axios';
import pool from '../database.js';

const router = express.Router();

//Searching for recipes by ingredient
router.get("/search", async (req, res) => {
    const ingredient = req.query.ingredient;
    if (!ingredient) {
        return res.status(400).json({ error: "Ingredient is needed" });
    }

    try{
        // Checking local database first
        const cached = await pool.query(
            "SELECT * FROM recipes WHERE title ILIKE $1 LIMIT 5", 
            [`%${ingredient}%`]
        );
        if(cached.rows.length > 0){
            return res.json(cached.rows);
        }
        
        // If not found in local DB, fetch from Spoonacular API
        const response = await axios.get(
            "https://api.spoonacular.com/recipes/findByIngredients", {
                params: {
                    ingredients: ingredient,
                    number: 5,
                    apiKey: process.env.SPOONACULAR_API_KEY
                }
            }
        );

        const recipes = response.data;

    //Storing a recipe in the database
    for (const r of recipes){

    const title = r.title || "No title";
    const ingredients = r.usedIngredients
        .map(ing => ing.original)
        .join(", ");
    const instructions = r.instructions || "No instructions";

    try{
        await pool.query(
            `INSERT INTO recipes (title, ingredients, instructions)
            VALUES ($1, $2, $3)
            ON CONFLICT (title) DO NOTHING`,
            [title, ingredients, instructions]
        );
    }
    catch (err){
        console.error("Error saving recipe locally:", err.message);
    }
}

    res.json(recipes);
    }
    catch (err){
        console.error(err);
        res.status(500).json({ error: "Internal server error" })
    }
});    

//Search recipes by name
router.get("/title", async (req, res) => {
    const title = req.query.title;
    if (!title) {
        return res.status(400).json({ error: "Please enter a title" });
    }

    try{
        const result = await pool.query(
            "SELECT * FROM recipes WHERE title ILIKE $1 LIMIT 10",
            [`%${title}%`]
        );
        
        if(result.rows.length > 0){
            return res.json(result.rows);
        }

        const response = await axios.get(
            "https://api.spoonacular.com/recipes/complexSearch", {
                params: {
                    query: title,
                    number: 10,
                    apiKey: process.env.SPOONACULAR_API_KEY
                }
            }
        );

        const recipes = response.data.results;

        //Storing a recipe in the database
        for (const r of recipes){
            
            const recipeTitle = r.title || "No title";
            const ingredients = "Ingredients not provided";
            const instructions = "Instructions not provided";

            try{
                await pool.query(
                    `INSERT INTO recipes (title, ingredients, instructions)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (title) DO NOTHING`,
                    [recipeTitle, ingredients, instructions]
                );
            }
            catch (err){
                console.error("Error saving recipe locally:", err.message);
            }
            }

    res.json(recipes);

        }
    catch (err){
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }   
});


export default router;