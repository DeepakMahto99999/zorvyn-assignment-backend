import dotenv from "dotenv";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import connectDB from "../config/db.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    // check existing admin
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log(" Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "admin123",
      10
    );

    await User.create({
      email: process.env.ADMIN_EMAIL || "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
      status: "active",
    });

    console.log(" Admin created successfully");

    await mongoose.connection.close(); // clean exit
    process.exit(0);

  } catch (error) {
    console.error(" Error seeding admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();