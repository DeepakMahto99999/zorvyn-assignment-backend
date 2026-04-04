import express from "express";
import cors from 'cors'
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())


app.get("/", (req, res) => {
    res.send("API running...");
});

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});