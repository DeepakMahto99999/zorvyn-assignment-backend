const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      return next(error);
    }

    if (!roles.includes(req.user.role)) {
      const error = new Error("Forbidden: Access denied");
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
};

export default allowRoles;