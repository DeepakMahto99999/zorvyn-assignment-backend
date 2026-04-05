import express from "express";
import {
  deactivateUser,
  getAllUsers,
  updateUser,
} from "../controllers/user.controller.js";

import verifyToken from "../middleware/auth.middleware.js";
import allowRoles from "../middleware/role.middleware.js";

const userRouter = express.Router();

//  GET all users (Admin only)
userRouter.get(
  "/",
  verifyToken,
  allowRoles("admin"),
  getAllUsers
);

//  UPDATE user (Admin only)
userRouter.patch(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  updateUser
);

//  DEACTIVATE user (Admin only)
userRouter.delete(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  deactivateUser
);

export default userRouter;