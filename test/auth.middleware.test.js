jest.mock("axios", () => ({
  get: jest.fn()
}));

const axios = require("axios");
const { requireAdmin } = require("../src/middleware/auth");

function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = "test-signature";
  return `${header}.${body}.${signature}`;
}

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
    process.env.JWT_SECRET = "supersecretkey";
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
    const req = { headers: { authorization: `Bearer ${signToken({ id: "u1", role: "guest" })}` } };
    const res = createRes();
    const next = jest.fn();

    await requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
    expect(axios.get).not.toHaveBeenCalled();
  });

  test("calls next for admin role", async () => {
    const req = { headers: { authorization: `Bearer ${signToken({ id: "u1", role: "admin" })}` } };
    const res = createRes();
    const next = jest.fn();

    await requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({ id: "u1", role: "admin", email: undefined });
    expect(axios.get).not.toHaveBeenCalled();
  });

  test("falls back to Auth Service for non-JWT bearer tokens", async () => {
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
    expect(axios.get).toHaveBeenCalledWith(
      "http://auth-service/auth/verify",
      {
        headers: {
          Authorization: "Bearer admin-token"
        },
        timeout: 5000
      }
    );
  });
});
