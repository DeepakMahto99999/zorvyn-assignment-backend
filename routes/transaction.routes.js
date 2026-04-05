import express from "express";

import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  exportTransactions,
} from "../controllers/transaction.controller.js";

import verifyToken from "../middleware/auth.middleware.js";
import allowRoles from "../middleware/role.middleware.js";
import { validateTransaction } from "../validators/transaction.validator.js";

const transactionRouter = express.Router();


//  CREATE (Admin only)
transactionRouter.post(
  "/",
  verifyToken,
  allowRoles("admin"),
  validateTransaction,
  createTransaction
);


//  GET ALL (All roles)
transactionRouter.get(
  "/",
  verifyToken,
  allowRoles("admin", "analyst", "viewer"),
  getTransactions
);

transactionRouter.get(
  "/export",
  verifyToken,
  allowRoles("admin", "analyst"),
  exportTransactions
);

//  GET SINGLE (All roles)
transactionRouter.get(
  "/:id",
  verifyToken,
  allowRoles("admin", "analyst", "viewer"),
  getTransactionById
);


//  UPDATE (Admin only)
transactionRouter.put(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  validateTransaction,
  updateTransaction
);


//  DELETE (Admin only)
transactionRouter.delete(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  deleteTransaction
);





export default transactionRouter;