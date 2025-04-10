const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const { test, registerUser, loginUser, logout, getProfile } = require("../controllers/authController");
const User = require("../models/user");
const { generateSalt, hashWithSalt, hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require("jsonwebtoken");

jest.mock("../models/user");
jest.mock("../helpers/auth");
jest.mock("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.get("/test", test);
app.post("/register", registerUser);
app.post("/login", loginUser);
app.post("/logout", logout);
app.get("/profile", getProfile);

describe('Auth Helpers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSalt', () => {
    it('should resolve with a salt when bcrypt.genSalt succeeds', async () => {
      const mockSalt = 'mockSalt';
      bcrypt.genSalt.mockImplementation((rounds, callback) => callback(null, mockSalt));

      const result = await generateSalt(12);
      expect(result).toBe(mockSalt);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(12, expect.any(Function));
    });

    it('should reject with an error when bcrypt.genSalt fails', async () => {
      const mockError = new Error('genSalt error');
      bcrypt.genSalt.mockImplementation((rounds, callback) => callback(mockError, null));

      await expect(generateSalt(12)).rejects.toThrow('genSalt error');
      expect(bcrypt.genSalt).toHaveBeenCalledWith(12, expect.any(Function));
    });
  });

  describe('hashWithSalt', () => {
    it('should resolve with a hash when bcrypt.hash succeeds', async () => {
      const mockHash = 'mockHash';
      bcrypt.hash.mockImplementation((password, salt, callback) => callback(null, mockHash));

      const result = await hashWithSalt('password123', 'mockSalt');
      expect(result).toBe(mockHash);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'mockSalt', expect.any(Function));
    });

    it('should reject with an error when bcrypt.hash fails', async () => {
      const mockError = new Error('hash error');
      bcrypt.hash.mockImplementation((password, salt, callback) => callback(mockError, null));

      await expect(hashWithSalt('password123', 'mockSalt')).rejects.toThrow('hash error');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'mockSalt', expect.any(Function));
    });
  });

  describe('hashPassword', () => {
    it('should resolve with a hashed password when successful', async () => {
      const mockSalt = 'mockSalt';
      const mockHash = 'mockHash';

      jest.spyOn(require('../helpers/auth'), 'generateSalt').mockResolvedValue(mockSalt);
      jest.spyOn(require('../helpers/auth'), 'hashWithSalt').mockResolvedValue(mockHash);

      const result = await hashPassword('password123');
      expect(result).toBe(mockHash);
      expect(require('../helpers/auth').generateSalt).toHaveBeenCalledWith(12);
      expect(require('../helpers/auth').hashWithSalt).toHaveBeenCalledWith('password123', mockSalt);
    });

    it('should throw an error if generateSalt fails', async () => {
      const mockError = new Error('generateSalt error');
      jest.spyOn(require('../helpers/auth'), 'generateSalt').mockRejectedValue(mockError);

      await expect(hashPassword('password123')).rejects.toThrow('generateSalt error');
    });

    it('should throw an error if hashWithSalt fails', async () => {
      const mockSalt = 'mockSalt';
      const mockError = new Error('hashWithSalt error');

      jest.spyOn(require('../helpers/auth'), 'generateSalt').mockResolvedValue(mockSalt);
      jest.spyOn(require('../helpers/auth'), 'hashWithSalt').mockRejectedValue(mockError);

      await expect(hashPassword('password123')).rejects.toThrow('hashWithSalt error');
    });
  });

  describe('comparePassword', () => {
    it('should resolve with true when passwords match', async () => {
      bcrypt.compare.mockResolvedValue(true);

      const result = await comparePassword('password123', 'hashedPassword');
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should resolve with false when passwords do not match', async () => {
      bcrypt.compare.mockResolvedValue(false);

      const result = await comparePassword('password123', 'hashedPassword');
      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });
  });
});

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