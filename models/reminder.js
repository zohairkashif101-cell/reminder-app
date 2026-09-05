const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  remindertime: {
    type: Date,
    required: true,
  },
  iscompleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Reminder", userSchema);