const mongoose = require("mongoose");
const validator=require("validator")


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, 
      lowercase: true,
      validate: [validator.isEmail, "Invalid email address"]

    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
