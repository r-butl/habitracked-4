const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');
const { HabitModel, CuratedHabitModel } = require('../models/habit');

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

// Logout endpoint
const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};

// Get profile endpoint
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

// Get habits endpoint
const getHabits = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const habits = await HabitModel.find({ userId });
    return res.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    return res.status(500).json({ error: 'Error fetching habits' });
  }
};

// Create habit endpoint
const createHabit = async (req, res) => {
  try {
    const {
      userId,
      name,
      icon,
      description,
      minTime,
      maxTime,
      timeBlock,
      visibility,
      start,
      end,
      recurrence
    } = req.body;

    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!start) return res.status(400).json({ error: 'Missing start' });
    if (!end) return res.status(400).json({ error: 'Missing end' });

    const newHabit = await HabitModel.create({
      userId,
      name,
      icon,
      description,
      minTime,
      maxTime,
      timeBlock,
      visibility,
      start,
      end,
      recurrence
    });
    if (visibility == 1){
      const newcuratedHabit = await CuratedHabitModel.create({
        name,
        icon,
        description,
        minTime,
        maxTime,
        timeBlock,
        visibility,
        start,
        end,
        recurrence
      });
    }
    return res.status(201).json(newHabit);
  } catch (error) {
    console.error('Error creating habit:', error);

    if (error.name === 'ValidationError') {
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

const getCuratedHabits = async (req, res) => {
  try {
    const curatedHabits = await CuratedHabitModel.find();
    return res.json(curatedHabits);
  } catch (error) {
    console.error('Error fetching curated habits:', error);
    return res.status(500).json({ error: 'Error fetching curated habits' });
  }
};

const updateHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    console.log("PATCH /habits/:habitId/updateHabit");
    console.log("Received habitId:", habitId);
    console.log("Request body:", req.body);

    // Only allow these fields to be updated
    const allowedFields = [
      "name", "icon", "description", "minTime", "maxTime",
      "timeBlock", "visibility", "start", "end", "recurrence"
    ];
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Convert visibility string to number
    if (updateData.visibility === "public") {
      updateData.visibility = 1;
    } else if (updateData.visibility === "private") {
      updateData.visibility = 0;
    }

    console.log("Filtered updateData:", updateData);

    // Find habit
    const habit = await HabitModel.findById(habitId);
    if (!habit) {
      return res.status(404).json({ error: "Habit not found" });
    }

    // Update habit
    const updatedHabit = await HabitModel.findByIdAndUpdate(
      habitId,
      updateData,
      { new: true }
    );

    if (!updatedHabit) {
      return res.status(404).json({ error: "Habit not found after update" });
    }

    console.log("Habit updated successfully:", updatedHabit);
    return res.json(updatedHabit);
  } catch (error) {
    console.error("Error updating habit:", error);
    return res.status(500).json({ error: "Server error while updating habit" });
  }
};

const deleteHabit = async (req, res) => {
  try {
    const { habitId } = req.params;

    const deletedHabit = await HabitModel.findByIdAndDelete(habitId);

    if (!deletedHabit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    return res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return res.status(500).json({ error: 'Server error while deleting habit' });
  }
};

// Creates a log for the user
const createLog = async (req, res) => {
  try {
    const { duration } = req.body;
    const { habitId } = req.params;
  
    // Check all fields
    if (!habitId) {
      return res.status(400).json( {error: 'Habit name is required.' });
    }
    if (duration == null) {
      return res.status(400).json( {error: 'Duration must be specified' });
    }

    // Attempt to find the user and habit 
    const habit = await HabitModel.findById(habitId);
    if (!habit) {
      return res.status(404).json( {error: 'Habit not found' });
    }

    const newLog = {
      date: new Date(),
      duration: duration
    }

    habit.logs.push(newLog);
    await habit.save();

    return res.status(200).json({ message: 'Log created successfully', log: newLog });

  } catch(error) {
    console.error("Internal server error.");
    return res.status(500).json({ error: 'Error creating log.'});

  }
}

// Grabs the list of logs for a user given a specific time frame
const getLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { habitId } = req.params;

    if (!habitId) {
      return res.status(404).json( {error: 'Habit ID not present' });
    }
    if (!startDate || isNaN(Date.parse(startDate))){
      return res.status(400).json({ error: 'Start date is required and must be a valid date' });
    }
    if (!endDate || isNaN(Date.parse(endDate))){
      return res.status(400).json({ error: 'End date is required and must be a valid date.'})
    }

    const habit = await HabitModel.findById(habitId);
    if (!habit) {
      return res.status(404).json( {error: 'Habit not found' })
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const filteredLogs = habit.logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= start && logDate <= end;
    });

    return res.status(200).json({ 
      habitId: habitId,
      logs: filteredLogs
    });

  } catch(error){
    console.error("Internal server error.");
    return res.status(500).json({ error: 'Error getting logs.' })
  }
}

module.exports = {
  registerUser,
  loginUser,
  logout,
  getProfile,
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  getCuratedHabits,
  createLog,
  getLogs
};
