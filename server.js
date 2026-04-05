import express from "express";
import cors from 'cors'
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import errorHandler from "./middleware/errorHandler.middleware.js";

import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js";
import transactionRouter from "./routes/transaction.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js";
import insightsRouter from "./routes/insights.routes.js";
import rateLimiter from "./middleware/rateLimiter.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())


// Rate Limiter
app.use(rateLimiter)

app.get("/", (req, res) => {
    res.send("API running...");
});

app.use('/api/auth',authRouter)
app.use('/api/users',userRouter)
app.use('/api/transaction',transactionRouter)
app.use('/api/dashboard',dashboardRouter)
app.use("/api/insights", insightsRouter);

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});