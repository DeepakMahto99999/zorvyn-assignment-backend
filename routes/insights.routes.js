import express from "express";
import {
  getCategoryInsights,
  getTrends,
  getIncomeVsExpense,
} from "../controllers/insights.controller.js";

import verifyToken from "../middleware/auth.middleware.js";
import allowRoles from "../middleware/role.middleware.js";

const insightsRouter = express.Router();

// 1. CATEGORY
insightsRouter.get(
  "/category",
  verifyToken,
  allowRoles("admin", "analyst"),
  getCategoryInsights
);

// 2. TRENDS
insightsRouter.get(
  "/trends",
  verifyToken,
  allowRoles("admin", "analyst"),
  getTrends
);

// 3. INCOME VS EXPENSE
insightsRouter.get(
  "/income-vs-expense",
  verifyToken,
  allowRoles("admin", "analyst"),
  getIncomeVsExpense
);

export default insightsRouter;