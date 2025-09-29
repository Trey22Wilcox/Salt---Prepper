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
        const cached = await pool.query(
            "SELECT * FROM recipes WHERE title ILIKE $1 LIMIT 5", 
            [`%${ingredient}%`]
        );
        if(cached.rows.length > 0){
            return res.json(cached.rows);
        }
        
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

        res.json(recipes);
    }
    catch (err){
        console.error(err);
        res.status(500).json({ error: "Internal server error" })
    }
});

export default router;