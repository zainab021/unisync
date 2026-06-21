const request = require("supertest");
const express = require("express");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(express.json());

// Apply rate limit
const limiter = rateLimit({ windowMs: 60000, max: 3, message: { message: "Too many requests." } });
app.use("/api/auth", limiter, require("../routes/auth"));

describe("Security Tests", () => {
  test("Protected route without token returns 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("Protected route with invalid token returns 403", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid_token_here");
    expect(res.status).toBe(403);
  });

  test("Rate limiting blocks after max attempts", async () => {
    // Hit login 4 times with wrong credentials
    for (let i = 0; i < 3; i++) {
      await request(app).post("/api/auth/login").send({ email: "x@x.com", password: "wrong" });
    }
    const res = await request(app).post("/api/auth/login").send({ email: "x@x.com", password: "wrong" });
    expect(res.status).toBe(429);
    expect(res.body.message).toContain("Too many");
  });
});
