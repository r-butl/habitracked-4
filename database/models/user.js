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

const getUserHabitModel = (userId) => {
  const habitSchema = new Schema({
    name: { 
      type: String, 
      required: true 
    },
    icon: { 
      type: String 
    },
    description: { 
      type: String 
    },
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
      enum: ['morning', 'afternoon', 'evening'],
      default: null
    },
    // controls whether habit is private or public
    // 0 = private, 1 = public
    visibility: { 
      type: Number, 
      required: true 
    },

    // Scheduling Fields
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    },
    recurrence: {
      type: String,
      enum: ['none', 'daily', 'weekly'],
      default: 'none'
    }

  }, { timestamps: true });

  const modelName = `Habit_${userId}`;
  const collectionName = `habits_${userId}`;
  return mongoose.models[modelName] || mongoose.model(modelName, habitSchema, collectionName);
};

// Initializes an empty habit collection for a user
const createUserHabitCollection = async (userId) => {
  const HabitModel = getUserHabitModel(userId);

  // Creates the actual collection in MongoDB
  await HabitModel.createCollection();

  console.log(`Empty habit collection initialized for user: ${userId}`);
};

module.exports = {
  UserModel,
  getUserHabitModel,
  createUserHabitCollection
};