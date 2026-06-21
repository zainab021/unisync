const request = require("supertest");
const express = require("express");

// Simple mock server for testing
const app = express();
app.use(express.json());
app.use("/api/auth", require("../routes/auth"));

describe("Auth API", () => {
  test("POST /api/auth/login — missing fields returns 400", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email and password required");
  });

  test("POST /api/auth/login — wrong email returns 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "notexist@test.com", password: "test123" });
    expect(res.status).toBe(401);
  });

  test("POST /api/auth/login — valid credentials returns token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@university.edu", password: "password" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.role).toBe("admin");
  });
});
