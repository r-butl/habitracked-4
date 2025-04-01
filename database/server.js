// equivalent to index.js 
import express from "express";
import cors from "cors";
import mongoose from 'mongoose';

import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

// routes
import authRoutes from './routes/authRoutes.js'

// database connection
mongoose.connect(process.env.ATLAS_URI)
.then(()=>console.log("Database Connected"))
.catch((err)=>console.log("Database not connected.", err))

const PORT = process.env.PORT || 5050;
const app = express();

app.use(express.json());
app.use('/', authRoutes)

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
