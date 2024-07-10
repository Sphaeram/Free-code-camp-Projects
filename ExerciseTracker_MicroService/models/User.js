const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
    },
    log: [{ description: String, duration: String, date: String }],
  },
  { versionKey: false }
);

module.exports = mongoose.model("User", userSchema);
