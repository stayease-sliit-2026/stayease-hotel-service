const request = require("supertest");
const app = require("../src/app");

// Test suite
describe("Health endpoint", () => {
  // Test case
  test("GET /health should return service status", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("status", "ok");
    expect(response.body).toHaveProperty("service", "hotel-listing");
  });
});