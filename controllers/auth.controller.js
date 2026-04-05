import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import asyncHandler from "../middleware/asyncHandler.middleware.js";


//  Generate JWT
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET not defined");
    error.statusCode = 500;
    throw error;
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};


//  LOGIN USER
export const login = asyncHandler(async (req, res) => {
  let { email, password } = req.body;

  // normalize input
  email = email?.trim().toLowerCase();
  password = password?.trim();

  // 1. Validate input
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  // 2. Find user
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  // 3. Check account status
  if (user.status !== "active") {
    const error = new Error("Account is inactive");
    error.statusCode = 401;
    throw error;
  }

  // 4. Compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  // 5. Generate token
  const token = generateToken(user);

  // 6. Response
  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
});


//  REGISTER USER (Admin only)
export const register = asyncHandler(async (req, res) => {
  let { email, password, role } = req.body;

  // normalize input
  email = email?.trim().toLowerCase();
  password = password?.trim();
  role = role?.trim().toLowerCase();

  // 1. Validate input
  if (!email || !password || !role) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    throw error;
  }

  // 2. Validate role
  const validRoles = ["viewer", "analyst"];
  if (!validRoles.includes(role)) {
    const error = new Error("Invalid role");
    error.statusCode = 400;
    throw error;
  }

  // 3. Prevent admin creation via API
  if (role === "admin") {
    const error = new Error("Cannot create admin via API");
    error.statusCode = 403;
    throw error;
  }

  // 4. Validate password strength
  if (password.length < 6) {
    const error = new Error("Password must be at least 6 characters");
    error.statusCode = 400;
    throw error;
  }

  // 5. Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 400;
    throw error;
  }

  // 6. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 7. Create user
  const newUser = await User.create({
    email,
    password: hashedPassword,
    role,
    status: "active",
  });

  // 8. Response
  res.status(201).json({
    success: true,
    message: "User created successfully",
    user: {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
    },
  });
});