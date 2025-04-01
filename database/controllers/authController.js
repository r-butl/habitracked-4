import User from '../models/user.js'
import { hashPassword, comparePassword } from '../helpers/auth.js';
import jwt from 'jsonwebtoken'

export const test = (req, res) => {
  res.json("test is working");
};

// Register endpoint
export const registerUser = async (req, res) => {
  try {
    const {name, email, password} = req.body;
    //check if name was entered
    if(!name){
      return res.json({
        error: 'name is required'
      })
    };
    // check if password is good
    if(!password || password.length < 6){
      return res.json({
        error: 'password is required and should be at least 6 characters long'
      })
    };
    // check email
    const exist = await User.findOne({email})
    if(exist){
      return res.json({
        error: 'email is taken already'
      })
    };

    const hashedPassword = await hashPassword(password)
    // create user is database 
    const user = await User.create({
      name, 
      email, 
      password: hashedPassword,
    });

    return res.json(user);
  } catch (error) {
    console.log(error)
  }
};

// Login endpoint 
export const loginUser = async (req, res) => {
  try {
    const {email, password} = req.body;

    // check if user exists
    const user = await User.findOne({email});
    if(!user){
      return res.json({
        error: 'no user found'
      })
    }

    // check if passwords match
    const match = await comparePassword(password, user.password)
    if(match) {
      // res.json('passwords match')
      jwt.sign({email: user.email, id: user._id, name: user.name}, process.env.JWT_SECRET, {}, (err, token) => {
        if(err) throw err;
        res.cookie('token', token).json(user)
      })
    } else {
      return res.json({
        error: 'passwords do not match'
      })
    }
  } catch (error) {
    console.log(error)
  }
}