jest.mock("../src/controllers/hotels.controller", () => ({
  listHotels: jest.fn((req, res) =>
    res.status(200).json({
      ok: true,
      query: req.query
    })
  ),
  getHotelById: jest.fn((req, res) =>
    res.status(200).json({
      ok: true,
      id: req.params.id
    })
  ),
  listRoomsByHotel: jest.fn((req, res) =>
    res.status(200).json({
      ok: true,
      id: req.params.id,
      query: req.query
    })
  ),
  createHotel: jest.fn(),
  updateHotel: jest.fn(),
  deleteHotel: jest.fn(),
  addRoomToHotel: jest.fn(),
  updateRoom: jest.fn(),
  deleteRoom: jest.fn()
}));

const request = require("supertest");
const controller = require("../src/controllers/hotels.controller");
const app = require("../src/app");

describe("Public hotel/room endpoints (request-level)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /hotels returns 200 and forwards query filters", async () => {
    const response = await request(app)
      .get("/hotels")
      .query({ location: "Colombo", minRating: "4", q: "sea" });

    expect(response.statusCode).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.query).toEqual({
      location: "Colombo",
      minRating: "4",
      q: "sea"
    });
    expect(controller.listHotels).toHaveBeenCalledTimes(1);
  });

  test("GET /hotels/:id returns 200 and forwards path parameter", async () => {
    const hotelId = "507f1f77bcf86cd799439011";
    const response = await request(app).get(`/hotels/${hotelId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.id).toBe(hotelId);
    expect(controller.getHotelById).toHaveBeenCalledTimes(1);
  });

  test("GET /hotels/:id/rooms returns 200 and forwards room filters", async () => {
    const hotelId = "507f1f77bcf86cd799439011";

    const response = await request(app)
      .get(`/hotels/${hotelId}/rooms`)
      .query({ isAvailable: "true", type: "suite" });

    expect(response.statusCode).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.id).toBe(hotelId);
    expect(response.body.query).toEqual({
      isAvailable: "true",
      type: "suite"
    });
    expect(controller.listRoomsByHotel).toHaveBeenCalledTimes(1);
  });

  test("Public routes do not call protected write controllers", async () => {
    await request(app).get("/hotels");

    expect(controller.createHotel).not.toHaveBeenCalled();
    expect(controller.updateHotel).not.toHaveBeenCalled();
    expect(controller.deleteHotel).not.toHaveBeenCalled();
    expect(controller.addRoomToHotel).not.toHaveBeenCalled();
    expect(controller.updateRoom).not.toHaveBeenCalled();
    expect(controller.deleteRoom).not.toHaveBeenCalled();
  });
});
