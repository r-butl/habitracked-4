import User from '../models/user.js'
import { hashPassword, comparePassword } from '../helpers/auth.js';

export const test = (req, res) => {
  res.json("test is working");
};

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