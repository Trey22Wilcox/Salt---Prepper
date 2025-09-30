import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import recipeRoutes from './routes/recipes.js';
import pool from './database.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/recipes', recipeRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});