jest.mock("../src/models/Hotel", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}));

jest.mock("../src/models/Room", () => ({
  find: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
  deleteMany: jest.fn()
}));

const Hotel = require("../src/models/Hotel");
const Room = require("../src/models/Room");
const controller = require("../src/controllers/hotels.controller");

function createRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("hotels controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("listHotels returns hotels", async () => {
    const hotels = [{ _id: "h1", name: "Sea View" }];
    Hotel.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(hotels)
    });

    const req = { query: {} };
    const res = createRes();
    const next = jest.fn();

    await controller.listHotels(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(hotels);
  });

  test("getHotelById returns 404 when not found", async () => {
    Hotel.findById.mockResolvedValue(null);

    const req = { params: { id: "missing-id" } };
    const res = createRes();
    const next = jest.fn();

    await controller.getHotelById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  test("createHotel returns 201", async () => {
    const created = { _id: "h1", name: "Blue Bay" };
    Hotel.create.mockResolvedValue(created);

    const req = {
      body: {
        name: "Blue Bay",
        location: "Colombo"
      }
    };
    const res = createRes();
    const next = jest.fn();

    await controller.createHotel(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });

  test("deleteHotel removes hotel and linked rooms", async () => {
    Hotel.findByIdAndDelete.mockResolvedValue({ _id: "h1" });
    Room.deleteMany.mockResolvedValue({ deletedCount: 3 });

    const req = { params: { id: "h1" } };
    const res = createRes();
    const next = jest.fn();

    await controller.deleteHotel(req, res, next);

    expect(Room.deleteMany).toHaveBeenCalledWith({ hotelId: "h1" });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("listRoomsByHotel returns 404 when hotel missing", async () => {
    Hotel.findById.mockResolvedValue(null);

    const req = { params: { id: "h1" }, query: {} };
    const res = createRes();
    const next = jest.fn();

    await controller.listRoomsByHotel(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(Room.find).not.toHaveBeenCalled();
  });

  test("updateRoom returns updated room", async () => {
    const updated = { _id: "r1", price: 120 };
    Room.findOneAndUpdate.mockResolvedValue(updated);

    const req = {
      params: { id: "h1", roomId: "r1" },
      body: { price: 120 }
    };
    const res = createRes();
    const next = jest.fn();

    await controller.updateRoom(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });
});
