// === tests/authController.test.js ===
const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const {  registerUser, loginUser, logout, getProfile, createHabit, updateHabit, deleteHabit, createLog, getLogs } = require("../controllers/authController");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

jest.mock('../models/habit', () => ({
  HabitModel: { 
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
  CuratedHabitModel: {}
}));
const { HabitModel, CuratedHabitModel } = require('../models/habit');

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
app.post("/register", registerUser);
app.post("/login", loginUser);
app.post("/logout", logout);
app.get("/profile", getProfile);
app.get("")

describe("Backend Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Register Tests", () => {
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
  });

  describe("Login Tests", () => {
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
  });

  describe("Profile retreival", () => {
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

  describe('Create Habit tests', () => {

    let res;

    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      jest.clearAllMocks();
      // Patch HabitModel.create to be a jest.fn (in case not already)
      HabitModel.create = jest.fn();
    });

    it('should return 400 if userId is missing', async () => {
      const req = { body: { name: 'Meditation', start: '2024-01-01', end: '2024-01-10' } };
      await createHabit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing userId' });
    });

    it('should return 400 if name is missing', async () => {
      const req = { body: { userId: 'u1', start: '2024-01-01', end: '2024-01-10' } };
      await createHabit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing name' });
    });

    it('should return 400 if start is missing', async () => {
      const req = { body: { userId: 'u1', name: 'Meditation', end: '2024-01-10' } };
      await createHabit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing start' });
    });

    it('should return 400 if end is missing', async () => {
      const req = { body: { userId: 'u1', name: 'Meditation', start: '2024-01-01' } };
      await createHabit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing end' });
    });

    it('should return 201 and create habit if valid input', async () => {
      const newHabit = { id: 'h1', userId: 'u1', name: 'Meditation' };
      HabitModel.create.mockResolvedValue(newHabit);

      const req = {
        body: {
          userId: 'u1',
          name: 'Meditation',
          start: '2024-01-01',
          end: '2024-01-10',
        }
      };

      await createHabit(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newHabit);
    });

    it('should return 400 with validation error details', async () => {
      const error = new Error('Validation error');
      error.name = 'ValidationError';
      error.errors = {
        name: { message: 'Name is required' },
        start: { message: 'Start date is invalid' }
      };
      HabitModel.create.mockRejectedValue(error);

      const req = {
        body: {
          userId: 'u1',
          name: ' ',
          start: 'invalid-date',
          end: '2024-01-10'
        }
      };

      await createHabit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: [
          { field: 'name', message: 'Name is required' },
          { field: 'start', message: 'Start date is invalid' }
        ]
      });
    });

    it('should return 500 on unknown server error', async () => {
      HabitModel.create.mockRejectedValue(new Error('Unexpected failure'));

      const req = {
        body: {
          userId: 'u1',
          name: 'Meditation',
          start: '2024-01-01',
          end: '2024-01-10'
        }
      };

      await createHabit(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error while creating habit' });
    });
  });

  describe('updateHabit', () => {
    let req, res;
  
    beforeEach(() => {
      req = {
        params: { habitId: '123' },
        body: { name: 'Updated Habit', minTime: 10 },
        user: { id: 'user1' }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      jest.clearAllMocks();
    });
  
    it('should update a habit and return the updated habit', async () => {
      HabitModel.findById.mockResolvedValue({ _id: '123', userId: 'user1' });
      HabitModel.findByIdAndUpdate.mockResolvedValue({ _id: '123', name: 'Updated Habit', minTime: 10 });
  
      await updateHabit(req, res);
  
      expect(HabitModel.findById).toHaveBeenCalledWith('123');
      expect(HabitModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        { name: 'Updated Habit', minTime: 10 },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith({ _id: '123', name: 'Updated Habit', minTime: 10 });
    });
  
    it('should return 403 if user does not own the habit', async () => {
      HabitModel.findById.mockResolvedValue({ _id: '123', userId: 'otherUser' });
  
      await updateHabit(req, res);
  
      expect(HabitModel.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized' });
    });
  
    it('should return 404 if habit not found after update', async () => {
      HabitModel.findById.mockResolvedValue({ _id: '123', userId: 'user1' });
      HabitModel.findByIdAndUpdate.mockResolvedValue(null);
  
      await updateHabit(req, res);
  
      expect(HabitModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Habit not found' });
    });
  
    it('should handle server errors', async () => {
      HabitModel.findById.mockRejectedValue(new Error('DB error'));
  
      await updateHabit(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error while updating habit' });
    });
  });

  describe('deleteHabit', () => {
    let req, res;
  
    beforeEach(() => {
      req = { params: { habitId: '123' } };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      jest.clearAllMocks();
    });
  
    it('should delete a habit and return success message', async () => {
      HabitModel.findByIdAndDelete.mockResolvedValue({ _id: '123', name: 'Test Habit' });
  
      await deleteHabit(req, res);
  
      expect(HabitModel.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(res.json).toHaveBeenCalledWith({ message: 'Habit deleted successfully' });
    });
  
    it('should return 404 if habit not found', async () => {
      HabitModel.findByIdAndDelete.mockResolvedValue(null);
  
      await deleteHabit(req, res);
  
      expect(HabitModel.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Habit not found' });
    });
  
    it('should handle server errors', async () => {
      HabitModel.findByIdAndDelete.mockRejectedValue(new Error('DB error'));
  
      await deleteHabit(req, res);
  
      expect(HabitModel.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error while deleting habit' });
    });
  });

  describe('Create Log test', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return 400 if habitId is missing', async () => {
      const req = { params: {}, body: { duration: 30 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createLog(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Habit name is required.' });
    });

    it('should return 400 if duration is missing', async () => {
      const req = { params: { habitID: 'abc123' }, body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createLog(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Duration must be specified' });
    });

    it('should return 404 if habit is not found', async () => {
      HabitModel.findById.mockResolvedValue(null);
      const req = { params: { habitID: 'abc123' }, body: { duration: 30 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createLog(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Habit not found' });
    });

    it('should return 200 and create log if habit is found', async () => {
      const mockHabit = {
        logs: [],
        save: jest.fn().mockResolvedValue(true),
      };
      HabitModel.findById.mockResolvedValue(mockHabit);

      const req = { params: { habitID: 'abc123' }, body: { duration: 45 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createLog(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Log created successfully',
        log: expect.objectContaining({ duration: 45 }),
      }));
    });

    it('should return 500 if there is a server error', async () => {
      HabitModel.findById.mockRejectedValue(new Error('DB Error'));
      const req = { params: { habitID: 'abc123' }, body: { duration: 30 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createLog(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error creating log.' });
    });
  });

  describe('Get Logs test', () => {
    let res;
  
    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });
  
    it('should return 400 if startDate is invalid', async () => {
      const req = {
        params: { habitID: 'abc123' },
        body: { startDate: 'invalid-date', endDate: '2024-01-01' }
      };
  
      await getLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Start date is required and must be a valid date'
      });
    });
  
    it('should return 400 if endDate is invalid', async () => {
      const req = {
        params: { habitID: 'abc123' },
        body: { startDate: '2024-01-01', endDate: 'invalid-date' }
      };
  
      await getLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'End date is required and must be a valid date.'
      });
    });
  
    it('should return 404 if habitID is missing', async () => {
      const req = { params: {}, body: { startDate: '2024-01-01', endDate: '2024-01-02' } };
  
      await getLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Habit not found' });
    });
  
    it('should return 404 if habit not found in DB', async () => {
      HabitModel.findById.mockResolvedValue(null);
      const req = {
        params: { habitID: 'abc123' },
        body: { startDate: '2024-01-01', endDate: '2024-01-02' }
      };
  
      await getLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Habit not found' });
    });
  
    it('should return filtered logs between dates', async () => {
      const mockLogs = [
        { date: '2024-01-01T12:00:00Z', duration: 30 },
        { date: '2024-01-05T12:00:00Z', duration: 15 },
        { date: '2024-01-10T12:00:00Z', duration: 45 }
      ];
      HabitModel.findById.mockResolvedValue({ logs: mockLogs });
  
      const req = {
        params: { habitID: 'abc123' },
        body: { startDate: '2024-01-02', endDate: '2024-01-08' }
      };
  
      await getLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        habitID: 'abc123',
        logs: [mockLogs[1]]
      });
    });
  
    it('should return 500 if an exception occurs', async () => {
      HabitModel.findById.mockRejectedValue(new Error('DB failure'));
  
      const req = {
        params: { habitID: 'abc123' },
        body: { startDate: '2024-01-01', endDate: '2024-01-10' }
      };
  
      await getLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error getting logs.' });
    });
  });

  

});