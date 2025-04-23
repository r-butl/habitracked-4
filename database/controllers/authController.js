const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');
const { UserModel, createUserHabitCollection, getUserHabitModel } = require('../models/user');

// Register endpoint
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name) {
      return res.json({ error: 'name is required' });
    }

    if (!password || password.length < 6) {
      return res.json({ error: 'password is required and should be at least 6 characters long' });
    }

    const exist = await UserModel.findOne({ email });
    if (exist) {
      return res.json({ error: 'email is taken already' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });

    // Initialize a habit collection with a dummy habit
    await createUserHabitCollection(user._id);

    return res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login endpoint
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const match = await comparePassword(password, user.password);
    if (match) {
      jwt.sign(
        { email: user.email, id: user._id, name: user.name },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie('token', token).json(user);
        }
      );
    } else {
      return res.status(401).json({ error: 'Passwords do not match' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};

const getProfile = (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
      if (err) throw err;
      res.json(user);
    });
  } else {
    res.json(null);
  }
};

const getHabits = async (req, res) => {
  try {
    const userId = req.query.userId; // Grab userId from query parameter

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const HabitModel = getUserHabitModel(userId);
    const habits = await HabitModel.find();

    return res.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    return res.status(500).json({ error: 'Error fetching habits' });
  }
};

const createHabit = async (req, res) => {
  try {
    const { userId, name, icon, description, minTime, maxTime, timeBlock, visibility, start, end } = req.body;
    if (!userId) return res.status(400).json({ error: `Missing userid` });
    if (!name) return res.status(400).json({ error: `Missing name` });
    if (!start) return res.status(400).json({ error: `Missing start` });
    if (!end) return res.status(400).json({ error: `Missing end` });
    if (visibility === undefined || visibility === null) return res.status(400).json({ error: `Missing visability` });

    const HabitModel = getUserHabitModel(userId);

    const newHabit = await HabitModel.create({
      name,
      icon,
      description,
      minTime,
      maxTime,
      timeBlock,
      visibility,
      start,
      end
    });

    return res.status(201).json(newHabit);
  } catch (error) {
    console.error('Error creating habit:', error);

    if (error.name === 'ValidationError') {
      // Extract the specific fields that caused the error
      const fieldErrors = Object.keys(error.errors).map((field) => ({
        field,
        message: error.errors[field].message,
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: fieldErrors,
      });
    }

    return res.status(500).json({ error: 'Server error while creating habit' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logout,
  getProfile,
  getHabits,
  createHabit
};