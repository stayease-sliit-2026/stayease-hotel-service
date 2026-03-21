const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    // Reference to the hotel this room belongs to
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true
    },
    // Room type (Single / Double / Suite)
    type: {
      type: String,
      required: true,
      trim: true
    },
    // Room price
    price: {
      type: Number,
      required: true,
      min: 0
    },
    // Room capacity
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    // Room description shown in listing/details views
    description: {
      type: String,
      trim: true,
      default: ""
    },
    // Room image URLs
    images: {
      type: [String],
      default: []
    },
    // Simple availability flag
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);