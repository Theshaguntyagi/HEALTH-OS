require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');

const {
  Profile, Meal, Weight, Sleep, Workout,
  Medicine, MedLog, Symptom, LabReport,
  Habit, HabitLog, WaterLog, AiChat
} = require('./models');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── MongoDB Connection ───────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected — HealthOS'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ── Helper ───────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];
const wrap  = fn => (req, res) => fn(req, res).catch(e => res.status(500).json({ error: e.message }));

// ═══════════════════════════════════════════════════════════════
//  PROFILE
// ═══════════════════════════════════════════════════════════════
app.get('/api/profile', wrap(async (req, res) => {
  let p = await Profile.findOne();
  if (!p) p = await Profile.create({});
  res.json(p);
}));

app.put('/api/profile', wrap(async (req, res) => {
  let p = await Profile.findOne();
  if (!p) p = new Profile();
  Object.assign(p, req.body);
  await p.save();
  res.json(p);
}));

// ═══════════════════════════════════════════════════════════════
//  MEALS
// ═══════════════════════════════════════════════════════════════
app.get('/api/meals', wrap(async (req, res) => {
  const { date, limit = 50 } = req.query;
  const filter = date ? { date } : {};
  const meals = await Meal.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit));
  res.json(meals);
}));

app.post('/api/meals', wrap(async (req, res) => {
  const meal = await Meal.create({ date: today(), ...req.body });
  res.status(201).json(meal);
}));

app.delete('/api/meals/:id', wrap(async (req, res) => {
  await Meal.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

// ═══════════════════════════════════════════════════════════════
//  WEIGHT
// ═══════════════════════════════════════════════════════════════
app.get('/api/weight', wrap(async (req, res) => {
  const logs = await Weight.find().sort({ date: -1 }).limit(30);
  res.json(logs);
}));

app.post('/api/weight', wrap(async (req, res) => {
  const entry = await Weight.create({ date: today(), ...req.body });
  res.status(201).json(entry);
}));

// ═══════════════════════════════════════════════════════════════
//  SLEEP
// ═══════════════════════════════════════════════════════════════
app.get('/api/sleep', wrap(async (req, res) => {
  const logs = await Sleep.find().sort({ date: -1 }).limit(30);
  res.json(logs);
}));

app.post('/api/sleep', wrap(async (req, res) => {
  const entry = await Sleep.create({ date: today(), ...req.body });
  res.status(201).json(entry);
}));

// ═══════════════════════════════════════════════════════════════
//  WORKOUTS
// ═══════════════════════════════════════════════════════════════
app.get('/api/workouts', wrap(async (req, res) => {
  const { date, limit = 20 } = req.query;
  const filter = date ? { date } : {};
  const logs = await Workout.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit));
  res.json(logs);
}));

app.post('/api/workouts', wrap(async (req, res) => {
  const entry = await Workout.create({ date: today(), ...req.body });
  res.status(201).json(entry);
}));

// ═══════════════════════════════════════════════════════════════
//  MEDICINES
// ═══════════════════════════════════════════════════════════════
app.get('/api/medicines', wrap(async (req, res) => {
  const meds = await Medicine.find({ active: true }).sort({ timing: 1 });
  res.json(meds);
}));

app.post('/api/medicines', wrap(async (req, res) => {
  const med = await Medicine.create(req.body);
  res.status(201).json(med);
}));

app.delete('/api/medicines/:id', wrap(async (req, res) => {
  await Medicine.findByIdAndUpdate(req.params.id, { active: false });
  res.json({ ok: true });
}));

// Med adherence log
app.get('/api/med-logs', wrap(async (req, res) => {
  const { date } = req.query;
  const filter = date ? { date } : { date: today() };
  const logs = await MedLog.find(filter).populate('medId');
  res.json(logs);
}));

app.post('/api/med-logs', wrap(async (req, res) => {
  const log = await MedLog.findOneAndUpdate(
    { date: today(), medId: req.body.medId },
    { taken: req.body.taken },
    { upsert: true, new: true }
  );
  res.json(log);
}));

// Adherence stats
app.get('/api/adherence-stats', wrap(async (req, res) => {
  const days = 30;
  const since = new Date();
  since.setDate(since.getDate() - days);
  const logs = await MedLog.find({
    createdAt: { $gte: since }
  });
  const taken  = logs.filter(l => l.taken).length;
  const total  = logs.length;
  const pct    = total ? Math.round((taken / total) * 100) : 0;
  res.json({ taken, total, pct, days });
}));

// ═══════════════════════════════════════════════════════════════
//  SYMPTOMS
// ═══════════════════════════════════════════════════════════════
app.get('/api/symptoms', wrap(async (req, res) => {
  const logs = await Symptom.find().sort({ createdAt: -1 }).limit(50);
  res.json(logs);
}));

app.post('/api/symptoms', wrap(async (req, res) => {
  const entry = await Symptom.create({ date: today(), ...req.body });
  res.status(201).json(entry);
}));

// ═══════════════════════════════════════════════════════════════
//  LAB REPORTS
// ═══════════════════════════════════════════════════════════════
app.get('/api/labs', wrap(async (req, res) => {
  const reports = await LabReport.find().sort({ date: -1 });
  res.json(reports);
}));

app.post('/api/labs', wrap(async (req, res) => {
  const report = await LabReport.create({ date: today(), ...req.body });
  res.status(201).json(report);
}));

// ═══════════════════════════════════════════════════════════════
//  HABITS
// ═══════════════════════════════════════════════════════════════
app.get('/api/habits', wrap(async (req, res) => {
  const habits = await Habit.find({ active: true });
  // Attach today's log status
  const todayStr = today();
  const logs = await HabitLog.find({ date: todayStr });
  const logMap = {};
  logs.forEach(l => { logMap[l.habitId.toString()] = l.done; });
  const result = habits.map(h => ({
    _id:  h._id,
    name: h.name,
    done: logMap[h._id.toString()] || false,
  }));
  res.json(result);
}));

app.post('/api/habits', wrap(async (req, res) => {
  const habit = await Habit.create({ name: req.body.name });
  res.status(201).json(habit);
}));

app.delete('/api/habits/:id', wrap(async (req, res) => {
  await Habit.findByIdAndUpdate(req.params.id, { active: false });
  res.json({ ok: true });
}));

app.post('/api/habits/:id/toggle', wrap(async (req, res) => {
  const log = await HabitLog.findOneAndUpdate(
    { date: today(), habitId: req.params.id },
    { done: req.body.done },
    { upsert: true, new: true }
  );
  res.json(log);
}));

// Habit streaks (last 7 days)
app.get('/api/habits/:id/streak', wrap(async (req, res) => {
  const streak = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = await HabitLog.findOne({ date: dateStr, habitId: req.params.id });
    streak.push(log?.done ? 1 : 0);
  }
  res.json({ streak });
}));

// ═══════════════════════════════════════════════════════════════
//  WATER
// ═══════════════════════════════════════════════════════════════
app.get('/api/water', wrap(async (req, res) => {
  const todayStr = today();
  let log = await WaterLog.findOne({ date: todayStr });
  if (!log) log = { date: todayStr, cups: 0, goal: 10 };
  res.json(log);
}));

app.post('/api/water', wrap(async (req, res) => {
  const todayStr = today();
  const log = await WaterLog.findOneAndUpdate(
    { date: todayStr },
    { cups: req.body.cups, goal: req.body.goal || 10 },
    { upsert: true, new: true }
  );
  res.json(log);
}));

// ═══════════════════════════════════════════════════════════════
//  AI CHAT HISTORY
// ═══════════════════════════════════════════════════════════════
app.get('/api/ai-chats', wrap(async (req, res) => {
  const chats = await AiChat.find().sort({ createdAt: 1 }).limit(100);
  res.json(chats);
}));

app.post('/api/ai-chats', wrap(async (req, res) => {
  const chat = await AiChat.create({
    date: today(),
    role: req.body.role,
    content: req.body.content,
  });
  res.status(201).json(chat);
}));

// ═══════════════════════════════════════════════════════════════
//  DASHBOARD SUMMARY
// ═══════════════════════════════════════════════════════════════
app.get('/api/dashboard', wrap(async (req, res) => {
  const todayStr = today();

  const [todayMeals, latestWeight, lastSleep, todayWorkouts, waterLog, symptoms7] = await Promise.all([
    Meal.find({ date: todayStr }),
    Weight.findOne().sort({ date: -1 }),
    Sleep.findOne().sort({ date: -1 }),
    Workout.find({ date: todayStr }),
    WaterLog.findOne({ date: todayStr }),
    Symptom.find().sort({ createdAt: -1 }).limit(10),
  ]);

  const totalCal  = todayMeals.reduce((s, m) => s + (m.cal || 0), 0);
  const totalProt = todayMeals.reduce((s, m) => s + (m.protein || 0), 0);
  const totalCarb = todayMeals.reduce((s, m) => s + (m.carbs || 0), 0);
  const totalFat  = todayMeals.reduce((s, m) => s + (m.fat || 0), 0);
  const totalStep = todayWorkouts.reduce((s, w) => s + (w.steps || 0), 0);

  // Sleep duration
  let sleepHrs = null;
  if (lastSleep) {
    const [sh, sm] = lastSleep.start.split(':').map(Number);
    const [eh, em] = lastSleep.end.split(':').map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff < 0) diff += 1440;
    sleepHrs = (diff / 60).toFixed(1);
  }

  res.json({
    date: todayStr,
    calories:  { consumed: totalCal, target: 2100 },
    macros:    { protein: totalProt, carbs: totalCarb, fat: totalFat },
    weight:    latestWeight ? { value: latestWeight.weight, date: latestWeight.date } : null,
    sleep:     lastSleep ? { hours: sleepHrs, quality: lastSleep.quality, date: lastSleep.date } : null,
    steps:     { today: totalStep, goal: 10000 },
    water:     waterLog ? { cups: waterLog.cups, goal: waterLog.goal } : { cups: 0, goal: 10 },
    symptoms:  symptoms7,
    mealCount: todayMeals.length,
  });
}));

// ═══════════════════════════════════════════════════════════════
//  WEIGHT TREND (7 days)
// ═══════════════════════════════════════════════════════════════
app.get('/api/weight-trend', wrap(async (req, res) => {
  const logs = await Weight.find().sort({ date: -1 }).limit(7);
  res.json(logs.reverse());
}));

// ═══════════════════════════════════════════════════════════════
//  SLEEP TREND (14 days)
// ═══════════════════════════════════════════════════════════════
app.get('/api/sleep-trend', wrap(async (req, res) => {
  const logs = await Sleep.find().sort({ date: -1 }).limit(14);
  res.json(logs.reverse());
}));

// ═══════════════════════════════════════════════════════════════
//  CALORIE TREND (7 days)
// ═══════════════════════════════════════════════════════════════
app.get('/api/calorie-trend', wrap(async (req, res) => {
  const results = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const meals = await Meal.find({ date: dateStr });
    const total = meals.reduce((s, m) => s + (m.cal || 0), 0);
    results.push({ date: dateStr, calories: total });
  }
  res.json(results);
}));

// ═══════════════════════════════════════════════════════════════
//  HEALTH SCORE (computed)
// ═══════════════════════════════════════════════════════════════
app.get('/api/health-score', wrap(async (req, res) => {
  const todayStr = today();
  const [waterLog, lastSleep, todayMeals, medLogs] = await Promise.all([
    WaterLog.findOne({ date: todayStr }),
    Sleep.findOne().sort({ date: -1 }),
    Meal.find({ date: todayStr }),
    MedLog.find({ date: todayStr }),
  ]);

  const waterPct = waterLog ? Math.min(waterLog.cups / 10, 1) : 0;
  const sleepH   = lastSleep ? (() => {
    const [sh,sm] = lastSleep.start.split(':').map(Number);
    const [eh,em] = lastSleep.end.split(':').map(Number);
    let d = (eh*60+em)-(sh*60+sm); if(d<0) d+=1440;
    return d/60;
  })() : 0;
  const sleepPct = Math.min(sleepH / 7.5, 1);
  const calPct   = todayMeals.length > 0 ? 1 : 0.3;
  const medPct   = medLogs.length ? medLogs.filter(l => l.taken).length / medLogs.length : 0.5;

  const score = Math.round((waterPct * 15 + sleepPct * 25 + calPct * 25 + medPct * 20 + 0.15 * 15));

  res.json({
    score: Math.min(score + 30, 100), // baseline offset
    factors: {
      water:    Math.round(waterPct * 100),
      sleep:    Math.round(sleepPct * 100),
      diet:     Math.round(calPct * 100),
      meds:     Math.round(medPct * 100),
    }
  });
}));

// ── Catch-all → serve frontend ───────────────────────────────
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Health OS running → http://localhost:${PORT}`);
});
