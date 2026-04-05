export const validateLogin = (req, res, next) => {
  if (!req.body) {
    const error = new Error("Request body is missing");
    error.statusCode = 400;
    throw error;
  }

  let { email, password } = req.body;

  email = email?.trim().toLowerCase();
  password = password?.trim();

  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  if (!email.includes("@")) {
    const error = new Error("Invalid email format");
    error.statusCode = 400;
    throw error;
  }

  next();
};