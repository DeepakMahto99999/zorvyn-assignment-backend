import express from "express";
import { login, register } from "../controllers/auth.controller.js";
import verifyToken from "../middleware/auth.middleware.js";
import allowRoles from "../middleware/role.middleware.js";

// validators
import { validateLogin } from "../validators/auth.validator.js";
import { validateUser } from "../validators/user.validator.js";

const router = express.Router();


//  LOGIN (Public)
router.post("/login", validateLogin, login);


//  REGISTER USER (Admin only)
router.post("/register", verifyToken, allowRoles("admin"), validateUser, register
);


export default router;