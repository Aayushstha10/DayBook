const mongoose = require("mongoose");
const validator = require("validator");

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
      validate: [validator.isEmail, "Invalid email address"],
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider !== "google";
      },
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
    },
    picture: {
      type: String,
    },
    role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  },
  
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);