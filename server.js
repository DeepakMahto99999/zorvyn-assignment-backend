import express from "express";
import cors from 'cors'
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import errorHandler from "./middleware/errorHandler.middleware.js";

import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js";
import transactionRouter from "./routes/transaction.routes.js"

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

app.use('/api/auth',authRouter)
app.use('/api/users',userRouter)
app.use('/api/transaction',transactionRouter)


app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});