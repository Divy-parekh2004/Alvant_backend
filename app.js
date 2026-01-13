require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/database");

const app = express();

// ✅ MIDDLEWARE (ORDER MATTERS)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ DATABASE CONNECTION MIDDLEWARE - Ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(503).json({
      error: "Service temporarily unavailable",
      message: "Database connection failed. Please try again later.",
    });
  }
});

// ✅ ROUTES
const contactRouter = require("./routes/contact");
const registerRouter = require("./routes/register");
const adminRouter = require("./routes/admin");

app.use("/api/contact", contactRouter);
app.use("/api/register", registerRouter);
app.use("/api/admin", adminRouter);

// ✅ ROOT ROUTE
app.get("/", (req, res) => {
  res.json({
    message: "Alvant Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      contact: "/api/contact",
      register: "/api/register",
      admin: "/api/admin",
    },
  });
});

// ✅ HEALTH CHECK
app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  res.json({
    status: "ok",
    database: dbStates[dbStatus] || "unknown",
    connected: dbStatus === 1,
  });
});

// ✅ 404 HANDLER - Return JSON for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found", path: req.path });
});

// ✅ ERROR HANDLER - Ensure all errors return JSON
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ✅ For local development only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// ✅ Export for Vercel serverless
module.exports = app;
