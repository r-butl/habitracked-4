const User = require('../models/user');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');

// Register endpoint
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name) {
      return res.json({
        error: 'name is required'
      });
    };

    if (!password || password.length < 6) {
      return res.json({
        error: 'password is required and should be at least 6 characters long'
      });
    };

    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({
        error: 'email is taken already'
      });
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.json(user);
  } catch (error) {
    console.log(error);
  }
};

// Login endpoint
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // If no user is found, return a 401 Unauthorized response
      return res.status(401).json({
        error: 'User not found'
      });
    }

    const match = await comparePassword(password, user.password);
     
    if (match) {
      jwt.sign(
        { email: user.email, 
          id: user._id, name: 
          user.name },
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

// Export all functions
module.exports = {
  //test,
  registerUser,
  loginUser,
  logout,
  getProfile
};