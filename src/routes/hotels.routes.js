const router = require("express").Router();
const { body } = require("express-validator");
const ctrl = require("../controllers/hotels.controller");
const { requireAdmin } = require("../middleware/auth");
const { validate } = require("../utils/validate");

// --------------------
// Public endpoints
// --------------------

// Get all hotels
router.get("/", ctrl.listHotels);

// Get one hotel by ID
router.get("/:id", ctrl.getHotelById);

// Get all rooms for a hotel
router.get("/:id/rooms", ctrl.listRoomsByHotel);

// --------------------
// Admin protected endpoints
// --------------------

// Create hotel
router.post(
  "/",
  // requireAdmin, // Temporarily disabled for testing purposes
  [
    body("name").isString().notEmpty().withMessage("Hotel name is required"),
    body("location").isString().notEmpty().withMessage("Location is required"),
    body("description").optional().isString(),
    body("rating").optional().isFloat({ min: 0, max: 5 }).withMessage("Rating must be between 0 and 5"),
    body("amenities").optional().isArray().withMessage("Amenities must be an array"),
    body("images").optional().isArray().withMessage("Images must be an array")
  ],
  validate,
  ctrl.createHotel
);

// Update hotel
router.put(
  "/:id",
  // requireAdmin, // Temporarily disabled for testing purposes
  [
    body("name").optional().isString().notEmpty().withMessage("Hotel name cannot be empty"),
    body("location").optional().isString().notEmpty().withMessage("Location cannot be empty"),
    body("description").optional().isString(),
    body("rating").optional().isFloat({ min: 0, max: 5 }).withMessage("Rating must be between 0 and 5"),
    body("amenities").optional().isArray().withMessage("Amenities must be an array"),
    body("images").optional().isArray().withMessage("Images must be an array")
  ],
  validate,
  ctrl.updateHotel
);

// Delete hotel
// router.delete("/:id", requireAdmin, ctrl.deleteHotel);
// Temporarily disabled for testing purposes
router.delete("/:id", ctrl.deleteHotel);

// Add room to hotel
router.post(
  "/:id/rooms",
  // requireAdmin, // Temporarily disabled for testing purposes
  [
    body("type").isString().notEmpty().withMessage("Room type is required"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("capacity").isInt({ min: 1 }).withMessage("Capacity must be at least 1"),
    body("isAvailable").optional().isBoolean().withMessage("isAvailable must be true or false")
  ],
  validate,
  ctrl.addRoomToHotel
);

// Update room
router.put(
  "/:id/rooms/:roomId",
  // requireAdmin, // Temporarily disabled for testing purposes
  [
    body("type").optional().isString().notEmpty().withMessage("Room type cannot be empty"),
    body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("capacity").optional().isInt({ min: 1 }).withMessage("Capacity must be at least 1"),
    body("isAvailable").optional().isBoolean().withMessage("isAvailable must be true or false")
  ],
  validate,
  ctrl.updateRoom
);

module.exports = router;