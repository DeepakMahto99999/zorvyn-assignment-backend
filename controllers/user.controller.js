import User from "../models/user.model.js";
import asyncHandler from "../middleware/asyncHandler.middleware.js";



const formatUser = (user) => ({
    id: user._id,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});


// 1. GET ALL USERS (Admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });


    const formattedUsers = users.map(formatUser)

    res.status(200).json({
        success: true,
        count: formattedUsers.length,
        users: formattedUsers,
    });
});


// 2. UPDATE USER (role or status)
export const updateUser = asyncHandler(async (req, res) => {
    let { role, status } = req.body;

    role = role?.trim().toLowerCase();
    status = status?.trim().toLowerCase();

    const user = await User.findById(req.params.id);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    // prevent self update
    if (req.user.id === user._id.toString()) {
        const error = new Error("You cannot modify your own account");
        error.statusCode = 400;
        throw error;
    }

    // prevent admin modification
    if (user.role === "admin") {
        const error = new Error("Cannot modify admin user");
        error.statusCode = 403;
        throw error;
    }

    // update fields if provided
    if (role) {
        const validRoles = ["viewer", "analyst"];
        if (!validRoles.includes(role)) {
            const error = new Error("Invalid role");
            error.statusCode = 400;
            throw error;
        }
        user.role = role;
    }

    if (status) {
        const validStatus = ["active", "inactive"];
        if (!validStatus.includes(status)) {
            const error = new Error("Invalid status");
            error.statusCode = 400;
            throw error;
        }
        user.status = status;
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: {
            id: user._id,
            email: user.email,
            role: user.role,
            status: user.status,
        },
    });
});


// 3. DEACTIVATE USER (Soft delete)
export const deactivateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    // prevent self-deactivation
    if (req.user.id === user._id.toString()) {
        const error = new Error("You cannot deactivate your own account");
        error.statusCode = 400;
        throw error;
    }

    if (user.role === "admin") {
        const error = new Error("Cannot deactivate admin");
        error.statusCode = 403;
        throw error;
    }

    user.status = "inactive";
    await user.save();

    res.status(200).json({
        success: true,
        message: "User deactivated successfully",
    });
});