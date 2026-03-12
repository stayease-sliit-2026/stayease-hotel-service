// Handles routes that do not exist
function notFound(req, res, next) {
  res.status(404).json({
    message: "Route not found"
  });
}

// Handles server errors
function errorHandler(err, req, res, next) {
  console.error(err);

  // Handle invalid MongoDB object ID errors
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format"
    });
  }

  // Default server error
  return res.status(500).json({
    message: "Internal server error"
  });
}

module.exports = { notFound, errorHandler };