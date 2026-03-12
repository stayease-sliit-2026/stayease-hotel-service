const Hotel = require("../models/Hotel");
const Room = require("../models/Room");

// GET /hotels
// Supports optional filters: location, minRating, q
exports.listHotels = async (req, res, next) => {
  try {
    const { location, minRating, q } = req.query;
    const filter = {};

    // Filter by location
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    // Filter by minimum rating
    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    // Search by hotel name
    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }

    // Find hotels matching filter
    const hotels = await Hotel.find(filter).sort({ createdAt: -1 });

    res.status(200).json(hotels);
  } catch (error) {
    next(error);
  }
};

// GET /hotels/:id
exports.getHotelById = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found"
      });
    }

    res.status(200).json(hotel);
  } catch (error) {
    next(error);
  }
};

// POST /hotels
exports.createHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.create({
      name: req.body.name,
      location: req.body.location,
      description: req.body.description || "",
      rating: req.body.rating || 0,
      amenities: req.body.amenities || [],
      images: req.body.images || []
    });

    res.status(201).json(hotel);
  } catch (error) {
    next(error);
  }
};

// PUT /hotels/:id
exports.updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,           // Return updated document
      runValidators: true  // Validate update values
    });

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found"
      });
    }

    res.status(200).json(hotel);
  } catch (error) {
    next(error);
  }
};

// DELETE /hotels/:id
exports.deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found"
      });
    }

    // Delete all rooms related to this hotel
    await Room.deleteMany({ hotelId: req.params.id });

    res.status(200).json({
      message: "Hotel deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

// GET /hotels/:id/rooms
exports.listRoomsByHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found"
      });
    }

    const rooms = await Room.find({ hotelId: req.params.id }).sort({ createdAt: -1 });

    res.status(200).json(rooms);
  } catch (error) {
    next(error);
  }
};

// POST /hotels/:id/rooms
exports.addRoomToHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found"
      });
    }

    const room = await Room.create({
      hotelId: req.params.id,
      type: req.body.type,
      price: req.body.price,
      capacity: req.body.capacity,
      isAvailable: req.body.isAvailable ?? true
    });

    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

// PUT /hotels/:id/rooms/:roomId
exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findOneAndUpdate(
      {
        _id: req.params.roomId,
        hotelId: req.params.id
      },
      req.body,
      {
        new: true,           // Return updated room
        runValidators: true  // Validate updated values
      }
    );

    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    res.status(200).json(room);
  } catch (error) {
    next(error);
  }
};