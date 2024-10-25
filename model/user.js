const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: String,
    password: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
