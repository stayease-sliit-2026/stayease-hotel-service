const { validationResult } = require("express-validator");

// Custom middleware to return validation errors
function validate(req, res, next) {
  const errors = validationResult(req);

  // If validation errors exist, return 400
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }

  // If validation passed, continue
  next();
}

module.exports = { validate };