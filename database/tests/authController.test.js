// === tests/authController.test.js ===
const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const { test, registerUser, loginUser, logout, getProfile } = require("../controllers/authController");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

jest.setTimeout(10000);
jest.mock("../models/user");
jest.mock("jsonwebtoken");

// ✅ Explicitly mock auth helpers here only
jest.mock("../helpers/auth", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));
const { hashPassword, comparePassword } = require("../helpers/auth");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.get("/test", test);
app.post("/register", registerUser);
app.post("/login", loginUser);
app.post("/logout", logout);
app.get("/profile", getProfile);

describe("Auth Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("POST /register - should register a new user", async () => {
    const mockUser = { name: "John Doe", email: "john@example.com", password: "hashed_password" };
    User.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue("hashed_password");
    User.create.mockResolvedValue(mockUser);

    const response = await request(app).post("/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
    expect(User.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
    expect(hashPassword).toHaveBeenCalledWith("password123");
    expect(User.create).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@example.com",
      password: "hashed_password",
    });
  });

  test("POST /register - should return error if email is already taken", async () => {
    User.findOne.mockResolvedValue({ email: "john@example.com" });

    const response = await request(app).post("/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.error).toBe("email is taken already");
  });

  test("POST /login - should log in a user and return a token", async () => {
    const mockUser = { _id: "123", name: "John Doe", email: "john@example.com", password: "hashed_password" };
    User.findOne.mockResolvedValue(mockUser);
    comparePassword.mockResolvedValue(true);
    jwt.sign.mockImplementation((payload, secret, options, callback) => callback(null, "mock_token"));

    const response = await request(app).post("/login").send({
      email: "john@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
    expect(response.headers["set-cookie"]).toBeDefined();
    expect(User.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
    expect(comparePassword).toHaveBeenCalledWith("password123", "hashed_password");
    expect(jwt.sign).toHaveBeenCalledWith(
      { email: "john@example.com", id: "123", name: "John Doe" },
      process.env.JWT_SECRET,
      {},
      expect.any(Function)
    );
  });

  test("POST /login - should return error if passwords do not match", async () => {
    const mockUser = { _id: "123", name: "John Doe", email: "john@example.com", password: "hashed_password" };
    User.findOne.mockResolvedValue(mockUser);
    comparePassword.mockResolvedValue(false);

    const response = await request(app).post("/login").send({
      email: "john@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Passwords do not match");
  });

  test("POST /logout - should clear the token cookie", async () => {
    const response = await request(app).post("/logout");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Logged out successfully" });
  });

  test("GET /profile - should return user profile if token is valid", async () => {
    jwt.verify.mockImplementation((token, secret, options, callback) => callback(null, { id: "123", name: "John Doe" }));

    const response = await request(app)
      .get("/profile")
      .set("Cookie", "token=mock_token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: "123", name: "John Doe" });
    expect(jwt.verify).toHaveBeenCalledWith("mock_token", process.env.JWT_SECRET, {}, expect.any(Function));
  });

  test("GET /profile - should return null if no token is provided", async () => {
    const response = await request(app).get("/profile");
    expect(response.status).toBe(200);
    expect(response.body).toBeNull();
  });
});