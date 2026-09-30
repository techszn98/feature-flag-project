require("./setup-env");

const { it } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/app");

it("reports API process liveness", async () => {
  const response = await request(app).get("/api/v1/health").expect(200);

  assert.deepEqual(response.body, {
    success: true,
    message: "API is running",
    data: null,
  });
});
