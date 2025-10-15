require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const vehicleRoutes = require("./routes/vehicles");
const fuelEntryRoutes = require("./routes/fuelEntries");
const profileRoutes = require("./routes/profile");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch(err => console.error(err));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
  cookie: {
    httpOnly: true,
    secure: false, // set true in prod HTTPS
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax"
  }
}));

//testing new

// Routes
app.use("/api/auth", authRoutes); // done 
app.use("/api/vehicles", vehicleRoutes); // done
app.use("/api/fuel-entries", fuelEntryRoutes); // 
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});