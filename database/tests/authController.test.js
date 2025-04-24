// === tests/authController.test.js ===
const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const { registerUser, loginUser, logout, getProfile, getHabits, createHabit, getCuratedHabits } = require("../controllers/authController");
const UserModel = require("../models/user");
const { HabitModel, CuratedHabitModel } = require("../models/habit");
const { hashPassword, comparePassword } = require("../helpers/auth");

const jwt = require("jsonwebtoken");

jest.setTimeout(10000);
jest.mock("../models/user");
jest.mock("jsonwebtoken");
jest.mock("../models/habit");

// ✅ Explicitly mock auth helpers here only
jest.mock("../helpers/auth", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use(cookieParser());
app.post("/register", registerUser);
app.post("/login", loginUser);
app.post("/logout", logout);
app.get("/profile", getProfile);
app.get("/habits", getHabits);
app.post("/habits", createHabit);
app.get("/curated-habits", getCuratedHabits);

describe("Auth Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("POST /register - should register a new user", async () => {
    const mockUser = { name: "John Doe", email: "john@example.com", password: "hashed_password" };
    UserModel.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue("hashed_password");
    UserModel.create.mockResolvedValue(mockUser);

    const response = await request(app).post("/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
    expect(UserModel.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
    expect(hashPassword).toHaveBeenCalledWith("password123");
    expect(UserModel.create).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@example.com",
      password: "hashed_password",
    });
  });

  test("POST /register - should return error if email is already taken", async () => {
    UserModel.findOne.mockResolvedValue({ email: "john@example.com" });

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
    UserModel.findOne.mockResolvedValue(mockUser);
    comparePassword.mockResolvedValue(true);
    jwt.sign.mockImplementation((payload, secret, options, callback) => callback(null, "mock_token"));

    const response = await request(app).post("/login").send({
      email: "john@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
    expect(response.headers["set-cookie"]).toBeDefined();
    expect(UserModel.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
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
    UserModel.findOne.mockResolvedValue(mockUser);
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


  describe("GET /habits", () => {
    test("should return habits for a valid userId", async () => {
      const mockHabits = [{ name: "Test Habit", userId: "abc123" }];
      HabitModel.find.mockResolvedValue(mockHabits);

      const response = await request(app).get("/habits").query({ userId: "abc123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockHabits);
      expect(HabitModel.find).toHaveBeenCalledWith({ userId: "abc123" });
    });

    test("should return 400 if userId is missing", async () => {
      const response = await request(app).get("/habits");
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("User ID is required");
    });

    test("should return 500 on DB error", async () => {
      HabitModel.find.mockRejectedValue(new Error("DB error"));
      const response = await request(app).get("/habits").query({ userId: "abc123" });
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error fetching habits");
    });
  });

  describe("POST /habits", () => {
    const validHabit = {
      userId: "abc123",
      name: "Test Habit",
      icon: "🔥",
      description: "desc",
      minTime: 10,
      maxTime: 20,
      timeBlock: "morning",
      visibility: "private",
      start: "2024-01-01",
      end: "2024-12-31",
      recurrence: "daily"
    };

    test("should create a habit with valid data", async () => {
      HabitModel.create.mockResolvedValue(validHabit);

      const response = await request(app).post("/habits").send(validHabit);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(validHabit);
      expect(HabitModel.create).toHaveBeenCalledWith(validHabit);
    });

    test("should return 400 if userId is missing", async () => {
      const { userId, ...body } = validHabit;
      const response = await request(app).post("/habits").send(body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing userId");
    });

    test("should return 400 if name is missing", async () => {
      const { name, ...body } = validHabit;
      const response = await request(app).post("/habits").send(body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing name");
    });

    test("should return 400 if start is missing", async () => {
      const { start, ...body } = validHabit;
      const response = await request(app).post("/habits").send(body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing start");
    });

    test("should return 400 if end is missing", async () => {
      const { end, ...body } = validHabit;
      const response = await request(app).post("/habits").send(body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing end");
    });

    test("should return 400 on validation error", async () => {
      const validationError = new Error("Validation failed");
      validationError.name = "ValidationError";
      validationError.errors = {
        name: { message: "Name is required" }
      };
      HabitModel.create.mockRejectedValue(validationError);

      const response = await request(app).post("/habits").send(validHabit);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Validation failed");
      expect(response.body.details).toEqual([{ field: "name", message: "Name is required" }]);
    });

    test("should return 500 on server error", async () => {
      HabitModel.create.mockRejectedValue(new Error("DB error"));
      const response = await request(app).post("/habits").send(validHabit);
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Server error while creating habit");
    });
  });

  describe("GET /curated-habits", () => {
    test("should return curated habits", async () => {
      const curated = [{ name: "Drink Water" }];
      CuratedHabitModel.find.mockResolvedValue(curated);

      const response = await request(app).get("/curated-habits");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(curated);
      expect(CuratedHabitModel.find).toHaveBeenCalled();
    });

    test("should return 500 on DB error", async () => {
      CuratedHabitModel.find.mockRejectedValue(new Error("DB error"));
      const response = await request(app).get("/curated-habits");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error fetching curated habits");
    });
  });

});
