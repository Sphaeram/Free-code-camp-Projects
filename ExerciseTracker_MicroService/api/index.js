const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const User = require("../models/User");

app.use(cors());
app.use(express.static(path.join(__dirname, "../public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Create a new user
app.post("/api/users", async (req, res) => {
  const { username } = req.body;
  const user = await User.create({ username });
  res.json({ username: user.username, _id: user._id });
});

// Get all users
app.get("/api/users", async (req, res) => {
  const users = await User.find({}, "username _id");
  res.json(users);
});

// Add an exercise to a user
app.post("/api/users/:_id/exercises", async (req, res) => {
  const { description, duration, date } = req.body;
  const userId = req.params._id;
  const exerciseDate = date ? new Date(date).toDateString() : new Date().toDateString();

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $push: { log: { description, duration: parseInt(duration), date: exerciseDate } },
    },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    _id: user._id,
    username: user.username,
    description,
    duration: parseInt(duration),
    date: exerciseDate,
  });
});

// Get a user's exercise log
app.get("/api/users/:_id/logs", async (req, res) => {
  const { from, to, limit } = req.query;
  const user = await User.findById(req.params._id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  let log = user.log;

  if (from) {
    const fromDate = new Date(from);
    log = log.filter((exercise) => new Date(exercise.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    log = log.filter((exercise) => new Date(exercise.date) <= toDate);
  }

  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: log.length,
    log: log.map((exercise) => ({
      description: exercise.description,
      duration: parseInt(exercise.duration),
      date: exercise.date,
    })),
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
