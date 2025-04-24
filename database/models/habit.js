const mongoose = require('mongoose');
const { Schema } = mongoose;

// Shared Habit model (all users' habits go here)
const habitSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  icon: { type: String },
  description: { type: String },
  minTime: { type: Number, required: true },
  maxTime: { type: Number, required: true },
  timeBlock: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    default: null
  },
  visibility: { type: Number, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  recurrence: {
    type: [String], // Array of strings
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    default: []
  }
}, { timestamps: true });

// Curated Habit model (for curated habits)
const curatedHabitSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String },
  description: { type: String },
  minTime: { type: Number, required: true },
  maxTime: { type: Number, required: true },
  timeBlock: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    default: null
  },
  visibility: { type: Number, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  recurrence: {
    type: [String], // Array of strings
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    default: []
  }
}, { timestamps: true });

const HabitModel = mongoose.model('Habit', habitSchema);
const CuratedHabitModel = mongoose.model('CuratedHabit', curatedHabitSchema, 'curatedHabits');

module.exports = {
  HabitModel,
  CuratedHabitModel
};
