require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const auth = require("./middleware/auth");
const loginroute = require("./routes/login");
const signuproute = require("./routes/signup");
const expensesroute=require("./routes/expenses")
const googleroute  = require("./routes/google");
const getroom=require("./routes/expenses")


const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5173",
  "https://day-book-eta.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// public routes
app.use("/api", signuproute);
app.use("/api", loginroute);
app.use("/api", googleroute);  
app.use("/api",auth,getroom);
app.use("/api",auth,expensesroute);


console.log("URI:", process.env.mongodb);

mongoose
  .connect(process.env.mongodb)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err.message));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});