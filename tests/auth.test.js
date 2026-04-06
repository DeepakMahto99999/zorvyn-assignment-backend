import request from "supertest";
import app from "../server.js";
import mongoose from "mongoose";

describe("Auth API", () => {

  it("should fail login without email and password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(res.statusCode).toBe(400);
  });

  it("should login successfully with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@gmail.com",
        password: "admin123",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

});

afterAll(async () => {
  await mongoose.connection.close();
});