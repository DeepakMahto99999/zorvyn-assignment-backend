import express from "express";
import { getDashboardSummary } from "../controllers/dashboard.controller.js";
import verifyToken from "../middleware/auth.middleware.js";
import allowRoles from "../middleware/role.middleware.js";

const dashboardRouter = express.Router();

dashboardRouter.get(
  "/summary",
  verifyToken,
  allowRoles("admin", "analyst", "viewer"),
  getDashboardSummary
);

export default dashboardRouter;