export const validateTransaction = (req, res, next) => {
  let { amount, type, category, date } = req.body;

  type = type?.trim().toLowerCase();
  category = category?.trim().toLowerCase();

  if (!amount || !type || !category || !date) {
    const error = new Error("Missing required fields");
    error.statusCode = 400;
    throw error;
  }

  if (amount < 0) {
    const error = new Error("Amount must be positive");
    error.statusCode = 400;
    throw error;
  }

  if (!["income", "expense"].includes(type)) {
    const error = new Error("Invalid type");
    error.statusCode = 400;
    throw error;
  }

  if (isNaN(new Date(date))) {
    const error = new Error("Invalid date format");
    error.statusCode = 400;
    throw error;
  }

  next();
};