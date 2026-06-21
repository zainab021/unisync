const request = require("supertest");
const express = require("express");

const app = express();
app.use(express.json());
app.use("/api/auth",       require("../routes/auth"));
app.use("/api/enrollment", require("../routes/enrollment"));

let adminToken = "";

beforeAll(async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@university.edu", password: "password" });
  adminToken = res.body.token;
});

describe("Enrollment API", () => {
  test("GET /api/enrollment without token returns 401", async () => {
    const res = await request(app).get("/api/enrollment");
    expect(res.status).toBe(401);
  });

  test("GET /api/enrollment with admin token returns array", async () => {
    const res = await request(app)
      .get("/api/enrollment")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /api/enrollment — missing fields returns 400 or 500", async () => {
    const res = await request(app)
      .post("/api/enrollment")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});
    expect([400, 500]).toContain(res.status);
  });
});
