const mongoose = require('mongoose');

// ─── Profile ───────────────────────────────────────────────
const profileSchema = new mongoose.Schema({
  firstName: { type: String, default: 'Rahul' },
  lastName:  { type: String, default: 'Sharma' },
  age:       { type: Number, default: 34 },
  gender:    { type: String, default: 'Male' },
  height:    { type: Number, default: 174 },
  weight:    { type: Number, default: 72.6 },
  activity:  { type: String, default: 'Lightly active' },
  diet:      { type: String, default: 'Vegetarian' },
  allergies: { type: String, default: 'None known' },
  goal:      { type: String, default: 'muscle' },
}, { timestamps: true });

// ─── Meal ──────────────────────────────────────────────────
const mealSchema = new mongoose.Schema({
  date:    { type: String, required: true },
  type:    { type: String, enum: ['Breakfast','Lunch','Dinner','Snack'], default: 'Breakfast' },
  items:   { type: String, default: '' },
  cal:     { type: Number, default: 0 },
  time:    { type: String, default: '' },
  protein: { type: Number, default: 0 },
  carbs:   { type: Number, default: 0 },
  fat:     { type: Number, default: 0 },
  notes:   { type: String, default: '' },
}, { timestamps: true });

// ─── Weight ────────────────────────────────────────────────
const weightSchema = new mongoose.Schema({
  date:   { type: String, required: true },
  weight: { type: Number, required: true },
  bf:     { type: Number, default: null },
  waist:  { type: Number, default: null },
  time:   { type: String, default: 'Morning (fasting)' },
}, { timestamps: true });

// ─── Sleep ─────────────────────────────────────────────────
const sleepSchema = new mongoose.Schema({
  date:    { type: String, required: true },
  start:   { type: String, default: '23:00' },
  end:     { type: String, default: '06:30' },
  quality: { type: Number, min: 1, max: 10, default: 7 },
  notes:   { type: String, default: '' },
}, { timestamps: true });

// ─── Workout ───────────────────────────────────────────────
const workoutSchema = new mongoose.Schema({
  date:      { type: String, required: true },
  type:      { type: String, default: '' },
  duration:  { type: Number, default: 0 },
  intensity: { type: String, default: 'Moderate' },
  calories:  { type: Number, default: 0 },
  steps:     { type: Number, default: 0 },
}, { timestamps: true });

// ─── Medicine ──────────────────────────────────────────────
const medicineSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  dosage:    { type: String, default: '' },
  timing:    { type: String, default: '08:00' },
  frequency: { type: String, default: 'Daily' },
  food:      { type: String, default: 'With food' },
  notes:     { type: String, default: '' },
  active:    { type: Boolean, default: true },
}, { timestamps: true });

// ─── MedLog ────────────────────────────────────────────────
const medLogSchema = new mongoose.Schema({
  date:  { type: String, required: true },
  medId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  taken: { type: Boolean, default: false },
}, { timestamps: true });

// ─── Symptom ───────────────────────────────────────────────
const symptomSchema = new mongoose.Schema({
  date:     { type: String, required: true },
  type:     { type: String, default: 'Fatigue' },
  severity: { type: Number, min: 1, max: 5, default: 2 },
  duration: { type: String, default: 'A few hours' },
  notes:    { type: String, default: '' },
}, { timestamps: true });

// ─── Lab Report ────────────────────────────────────────────
const labReportSchema = new mongoose.Schema({
  date:    { type: String, required: true },
  name:    { type: String, default: 'Blood Test' },
  markers: [{ name: String, value: String, unit: String, range: String, status: String }],
  notes:   { type: String, default: '' },
}, { timestamps: true });

// ─── Habit ─────────────────────────────────────────────────
const habitSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

// ─── Habit Log ─────────────────────────────────────────────
const habitLogSchema = new mongoose.Schema({
  date:    { type: String, required: true },
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit' },
  done:    { type: Boolean, default: false },
}, { timestamps: true });

// ─── Water Log ─────────────────────────────────────────────
const waterLogSchema = new mongoose.Schema({
  date:  { type: String, required: true },
  cups:  { type: Number, default: 0 },
  goal:  { type: Number, default: 10 },
}, { timestamps: true });

// ─── AI Chat ───────────────────────────────────────────────
const aiChatSchema = new mongoose.Schema({
  date:    { type: String, required: true },
  role:    { type: String, enum: ['user','assistant'], required: true },
  content: { type: String, required: true },
}, { timestamps: true });

module.exports = {
  Profile:   mongoose.model('Profile',   profileSchema),
  Meal:      mongoose.model('Meal',      mealSchema),
  Weight:    mongoose.model('Weight',    weightSchema),
  Sleep:     mongoose.model('Sleep',     sleepSchema),
  Workout:   mongoose.model('Workout',   workoutSchema),
  Medicine:  mongoose.model('Medicine',  medicineSchema),
  MedLog:    mongoose.model('MedLog',    medLogSchema),
  Symptom:   mongoose.model('Symptom',   symptomSchema),
  LabReport: mongoose.model('LabReport', labReportSchema),
  Habit:     mongoose.model('Habit',     habitSchema),
  HabitLog:  mongoose.model('HabitLog',  habitLogSchema),
  WaterLog:  mongoose.model('WaterLog',  waterLogSchema),
  AiChat:    mongoose.model('AiChat',    aiChatSchema),
};
