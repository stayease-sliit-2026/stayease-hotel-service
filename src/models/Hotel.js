const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    // Hotel name
    name: {
      type: String,
      required: true,
      trim: true
    },
    // Hotel location
    location: {
      type: String,
      required: true,
      trim: true
    },
    // Optional description
    description: {
      type: String,
      default: ""
    },
    // Rating between 0 and 5
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    // List of hotel amenities
    amenities: [
      {
        type: String,
        trim: true
      }
    ],
    // Image URLs
    images: [
      {
        type: String,
        trim: true
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);