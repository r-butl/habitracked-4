// equivalent to index.js 
const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

// routes
const authRoutes = require('./routes/authRoutes.js');

// database connection
mongoose.connect(process.env.ATLAS_URI)
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log("Database not connected.", err));

const PORT = process.env.PORT || 5050;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use('/', authRoutes);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});