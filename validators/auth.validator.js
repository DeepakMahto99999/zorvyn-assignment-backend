export const validateLogin = (req, res, next) => {
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