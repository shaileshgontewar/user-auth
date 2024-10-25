const mongoose = require("mongoose");
const errorMiddleware = (err, req, res, next) => {
//   console.error(err, "errorMiddleware");
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: "Validation Error",
      errors: err.errors,
    });
  }
  res.status(500).json({ message: 'Internal Server Error' });
};

module.exports = errorMiddleware;
