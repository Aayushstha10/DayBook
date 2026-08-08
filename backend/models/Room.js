const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "joined"],
      default: "pending",
    },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // The room creator / owner. Adjust `ref` if your User model is named
    // differently.
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [memberSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);