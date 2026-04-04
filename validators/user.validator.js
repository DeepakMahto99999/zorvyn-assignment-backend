export const validateUser = (req, res, next) => {
  let { email, password, role } = req.body;

  email = email?.trim().toLowerCase();
  password = password?.trim();
  role = role?.trim().toLowerCase();

  if (!email || !password || !role) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    throw error;
  }

  if (!email.includes("@")) {
    const error = new Error("Invalid email format");
    error.statusCode = 400;
    throw error;
  }

  const validRoles = ["viewer", "analyst"];
  if (!validRoles.includes(role)) {
    const error = new Error("Invalid role");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error("Password must be at least 6 characters");
    error.statusCode = 400;
    throw error;
  }

  next();
};