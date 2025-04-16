const mongoose = require('mongoose');
const { Schema } = mongoose;

// --- User Schema ---
const userSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    unique: true, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  },
}, { timestamps: true });

const UserModel = mongoose.model('User', userSchema);

// --- Habit Schema (Generic) ---
const getUserHabitModel = (userId) => {
  const habitSchema = new Schema({
    name: { 
      type: String, 
      required: true 
    },
    icon: { String }, // File path or URL
    description: { String },
    minTime: {
      type: Number, 
      required: true 
    },
    maxTime: { 
      type: Number, 
      required: true 
    },
    timeBlock: {
      type: String,
      enum: ['morning', 'midday', 'evening'],
      default: null
    }
  }, { timestamps: true });

  const modelName = `Habit_${userId}`;
  const collectionName = `habits_${userId}`;
  return mongoose.models[modelName] || mongoose.model(modelName, habitSchema, collectionName);
};

const createUserHabitCollection = async (userId) => {
  const HabitModel = getUserHabitModel(userId);

  const dummy = new HabitModel({
    name: "Dummy Habit",
    icon: "/icons/dummy.png",
    description: "This is a placeholder habit.",
    minTime: 5,
    maxTime: 10,
    timeBlock: "morning"
  });

  await dummy.save();
  console.log(`Habit collection created for user: ${userId}`);
};

module.exports = {
  UserModel,
  getUserHabitModel,
  createUserHabitCollection
};