jest.mock("axios", () => ({
  get: jest.fn()
}));

const axios = require("axios");
const { requireAdmin } = require("../src/middleware/auth");

function createRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("requireAdmin middleware", () => {
  const previousAuthUrl = process.env.AUTH_SERVICE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AUTH_SERVICE_URL = "http://auth-service";
  });

  afterAll(() => {
    process.env.AUTH_SERVICE_URL = previousAuthUrl;
  });

  test("returns 401 when Authorization header is missing", async () => {
    const req = { headers: {} };
    const res = createRes();
    const next = jest.fn();

    await requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 403 for non-admin role", async () => {
    axios.get.mockResolvedValue({
      data: {
        user: { id: "u1", role: "guest" }
      }
    });

    const req = { headers: { authorization: "Bearer test-token" } };
    const res = createRes();
    const next = jest.fn();

    await requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next for admin role", async () => {
    axios.get.mockResolvedValue({
      data: {
        user: { id: "u1", role: "admin" }
      }
    });

    const req = { headers: { authorization: "Bearer admin-token" } };
    const res = createRes();
    const next = jest.fn();

    await requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({ id: "u1", role: "admin" });
  });
});
