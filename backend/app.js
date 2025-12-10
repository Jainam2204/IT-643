const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const logger = require("./utils/logger");
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");
const messagesRoutes = require("./routes/messages");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const suggestionsRoute = require("./routes/connect");
const meetingRoutes = require("./routes/meeting");
const chatRoutes = require("./routes/chat");
const subscriptionRoutes = require("./routes/subscription");
const reportRoutes = require("./routes/report");
const corsConfig = require("./config/cors");
const helmetConfig = require("./config/helmet");
const errorHandler = require("./middleware/errorhandler");

const app = express();

// Global middleware
app.use(helmetConfig);
app.use(corsConfig);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Public / infra endpoints (no /api prefix, no rate limit)


app.get("/", (req, res) =>
  res.json({ message: "API is Running", version: "1.0.0" })
);

app.set("trust proxy", 1);

// 👇 All routes under /api will now be rate limited
app.use("/api", apiLimiter);

// Static files as API path
app.use("/api/uploads", express.static("uploads"));

// Auth routes: extra strict limiter on top of apiLimiter
app.use("/api/auth", authLimiter, authRoutes);
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});
// Other feature routes under /api
app.use("/api/messages", messagesRoutes);
app.use("/api/user", userRoutes);
app.use("/api/connect", suggestionsRoute);
app.use("/api/meetings", meetingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/report", reportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
