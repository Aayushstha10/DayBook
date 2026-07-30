const mongoose = require("mongoose");

const expensesSchema = new mongoose.Schema(
  {
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
      validate: {
        validator: function (value) {
          return !isNaN(new Date(value).getTime());
        },
        message: "Please enter a valid date",
      },
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("expenses", expensesSchema);
