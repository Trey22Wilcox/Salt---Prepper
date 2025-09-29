import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import pool from './database.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
