// === tests/authHelpers.test.js ===
jest.mock("bcrypt", () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

const bcrypt = require("bcrypt");
const { hashPassword, comparePassword } = require("../../helpers/auth");

describe("Auth Helpers", () => {
  const password = "secure123";
  const hashedPassword = "mockedHashedPassword";

  beforeEach(() => {
    jest.clearAllMocks();

    bcrypt.genSalt.mockImplementation((rounds, callback) => {
      callback(null, "mocked_salt");
    });

    bcrypt.hash.mockImplementation((password, salt, callback) => {
      callback(null, hashedPassword);
    });

    bcrypt.compare.mockImplementation((password, hash, callback) => {
      const isMatch = password === "secure123";
      callback(null, isMatch);
    });
  });

  test("should hash password and match it correctly", async () => {
    const hashed = await hashPassword(password);
    expect(typeof hashed).toBe("string");
    expect(hashed).toBe(hashedPassword);

    const isMatch = await comparePassword(password, hashed);
    expect(isMatch).toBe(true);
  });

  test("should return error when hashing fails", async () => {
    bcrypt.genSalt.mockImplementation((rounds, cb) => {
      cb(new Error("Salt error"), null);
    });

    await expect(hashPassword(password)).rejects.toThrow("Salt error");
  });

  test("should throw an error if bcrypt.compare fails for compare password", async () => {
    bcrypt.compare.mockImplementation((password, hash, cb) => {
      cb(new Error('Mocked bcrypt error'), null);
    })

    await expect(comparePassword('test123', 'hashedPass'))
      .rejects
      .toThrow('Mocked bcrypt error');
  });

  test("should return false if password does not match hashed one", async () => {
    bcrypt.compare.mockImplementation((password, hash, cb) => {
      cb(null, false);
    });

    const hashed = await hashPassword(password);
    const isMatch = await comparePassword("wrongpassword", hashed);
    expect(isMatch).toBe(false);
  });
});