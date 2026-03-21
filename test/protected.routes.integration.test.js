jest.mock("axios", () => ({
  get: jest.fn()
}));

jest.mock("../src/controllers/hotels.controller", () => ({
  listHotels: jest.fn((req, res) => res.status(200).json([])),
  getHotelById: jest.fn((req, res) => res.status(200).json({ _id: req.params.id })),
  listRoomsByHotel: jest.fn((req, res) => res.status(200).json([])),
  createHotel: jest.fn((req, res) => res.status(201).json({ created: true })),
  updateHotel: jest.fn((req, res) => res.status(200).json({ updated: true })),
  deleteHotel: jest.fn((req, res) => res.status(200).json({ deleted: true })),
  addRoomToHotel: jest.fn((req, res) => res.status(201).json({ created: true })),
  updateRoom: jest.fn((req, res) => res.status(200).json({ updated: true })),
  deleteRoom: jest.fn((req, res) => res.status(200).json({ deleted: true }))
}));

const request = require("supertest");
const axios = require("axios");
const controller = require("../src/controllers/hotels.controller");
const app = require("../src/app");

describe("Protected hotel/room endpoints (request-level)", () => {
  const previousAuthUrl = process.env.AUTH_SERVICE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AUTH_SERVICE_URL = "http://auth-service";
  });

  afterAll(() => {
    process.env.AUTH_SERVICE_URL = previousAuthUrl;
  });

  test("returns 401 for protected endpoints without bearer token", async () => {
    const responses = await Promise.all([
      request(app).post("/hotels").send({ name: "H1", location: "Colombo" }),
      request(app).put("/hotels/507f1f77bcf86cd799439011").send({ name: "Updated" }),
      request(app).delete("/hotels/507f1f77bcf86cd799439011"),
      request(app)
        .post("/hotels/507f1f77bcf86cd799439011/rooms")
        .send({ type: "Deluxe", price: 120, capacity: 2 }),
      request(app)
        .put("/hotels/507f1f77bcf86cd799439011/rooms/507f191e810c19729de860ea")
        .send({ price: 150 }),
      request(app).delete("/hotels/507f1f77bcf86cd799439011/rooms/507f191e810c19729de860ea")
    ]);

    responses.forEach((response) => {
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe("Missing or invalid Authorization header");
    });

    expect(controller.createHotel).not.toHaveBeenCalled();
    expect(controller.updateHotel).not.toHaveBeenCalled();
    expect(controller.deleteHotel).not.toHaveBeenCalled();
    expect(controller.addRoomToHotel).not.toHaveBeenCalled();
    expect(controller.updateRoom).not.toHaveBeenCalled();
    expect(controller.deleteRoom).not.toHaveBeenCalled();
  });

  test("returns 403 when token is valid but user role is not admin", async () => {
    axios.get.mockResolvedValue({
      data: {
        user: { id: "u1", role: "guest" }
      }
    });

    const responses = await Promise.all([
      request(app)
        .post("/hotels")
        .set("Authorization", "Bearer guest-token")
        .send({ name: "H1", location: "Colombo" }),
      request(app)
        .delete("/hotels/507f1f77bcf86cd799439011")
        .set("Authorization", "Bearer guest-token"),
      request(app)
        .delete("/hotels/507f1f77bcf86cd799439011/rooms/507f191e810c19729de860ea")
        .set("Authorization", "Bearer guest-token")
    ]);

    responses.forEach((response) => {
      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe("Admin access required");
    });

    expect(controller.createHotel).not.toHaveBeenCalled();
    expect(controller.deleteHotel).not.toHaveBeenCalled();
    expect(controller.deleteRoom).not.toHaveBeenCalled();
  });

  test("allows admin users through protected endpoints", async () => {
    axios.get.mockResolvedValue({
      data: {
        user: { id: "u1", role: "admin" }
      }
    });

    const createHotelResponse = await request(app)
      .post("/hotels")
      .set("Authorization", "Bearer admin-token")
      .send({
        name: "Ocean View",
        location: "Galle",
        rating: 4.8
      });

    const addRoomResponse = await request(app)
      .post("/hotels/507f1f77bcf86cd799439011/rooms")
      .set("Authorization", "Bearer admin-token")
      .send({
        type: "Suite",
        price: 240,
        capacity: 3,
        description: "Sea-facing suite",
        images: ["https://example.com/room.jpg"],
        isAvailable: true
      });

    const updateRoomResponse = await request(app)
      .put("/hotels/507f1f77bcf86cd799439011/rooms/507f191e810c19729de860ea")
      .set("Authorization", "Bearer admin-token")
      .send({
        price: 260,
        images: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA"]
      });

    const deleteHotelResponse = await request(app)
      .delete("/hotels/507f1f77bcf86cd799439011")
      .set("Authorization", "Bearer admin-token");

    expect(createHotelResponse.statusCode).toBe(201);
    expect(addRoomResponse.statusCode).toBe(201);
    expect(updateRoomResponse.statusCode).toBe(200);
    expect(deleteHotelResponse.statusCode).toBe(200);

    expect(controller.createHotel).toHaveBeenCalledTimes(1);
    expect(controller.addRoomToHotel).toHaveBeenCalledTimes(1);
    expect(controller.updateRoom).toHaveBeenCalledTimes(1);
    expect(controller.deleteHotel).toHaveBeenCalledTimes(1);
  });

  test("returns 400 for admin requests with invalid payloads", async () => {
    axios.get.mockResolvedValue({
      data: {
        user: { id: "u1", role: "admin" }
      }
    });

    const invalidCreateResponse = await request(app)
      .post("/hotels")
      .set("Authorization", "Bearer admin-token")
      .send({
        name: "",
        location: ""
      });

    const invalidRoomResponse = await request(app)
      .post("/hotels/507f1f77bcf86cd799439011/rooms")
      .set("Authorization", "Bearer admin-token")
      .send({
        type: "",
        price: -10,
        capacity: 0,
        images: ["invalid-image-string"]
      });

    expect(invalidCreateResponse.statusCode).toBe(400);
    expect(invalidCreateResponse.body.message).toBe("Validation failed");

    expect(invalidRoomResponse.statusCode).toBe(400);
    expect(invalidRoomResponse.body.message).toBe("Validation failed");

    expect(controller.createHotel).not.toHaveBeenCalled();
    expect(controller.addRoomToHotel).not.toHaveBeenCalled();
  });
});
