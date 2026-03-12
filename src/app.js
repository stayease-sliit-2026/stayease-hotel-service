require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

// Import routes and error handlers
const hotelRoutes = require("./routes/hotels.routes");
const { notFound, errorHandler } = require("./middleware/error");

// Load OpenAPI YAML file
const swaggerDocument = YAML.load("./openapi.yaml");

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Swagger / OpenAPI documentation UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Simple health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "hotel-listing"
  });
});

// Main hotel routes
app.use("/hotels", hotelRoutes);

// Error handling middleware
app.use(notFound);     // For routes that do not exist
app.use(errorHandler); // For server/runtime errors

module.exports = app;