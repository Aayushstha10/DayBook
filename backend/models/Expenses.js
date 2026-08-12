const mongoose = require("mongoose");

const splitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const expensesSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room is required"],
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [50, "Title cannot exceed 50 characters"],
      match: [/^[A-Za-z\s]+$/, "Title can only contain letters and spaces"],
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than 0"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
      max: [Date.now, "Future dates are not allowed"],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    split: {
      members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      perPersonAmount: { type: Number },
    },
  },
  {
    timestamps: true,
  },
);

expensesSchema.index({ room: 1, date: -1 });

module.exports = mongoose.model("expenses", expensesSchema);
