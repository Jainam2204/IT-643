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
const chatRoutes = require('./routes/chat');
const subscriptionRoutes = require('./routes/subscription');
const reportRoutes = require('./routes/report');

const app = express();

// Security headers with Socket.io compatibility
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Required for Socket.io
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Adjust based on your needs
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "http:"], // For Cloudinary and local images
        connectSrc: [
          "'self'",
          process.env.CLIENT_URL,
          process.env.FRONTEND_URL,
        ].filter(Boolean), // For Socket.io and API calls
        fontSrc: ["'self'", "data:"],
      },
    },
  })
);

// Gzip compression
app.use(compression());

// // CORS configuration
// const allowedOrigins = [
//   process.env.CLIENT_URL,
//   process.env.FRONTEND_URL,
//   process.env.NODE_ENV === 'development' ? process.env.CLIENT_URL : null,
// ].filter(Boolean);

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
      
//       if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
//         callback(null, true);
//       } else {
//         logger.warn(`CORS blocked origin: ${origin}`);
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   })
// );

const allowedOrigins = [
  "http://localhost:5173",      // dev frontend
  process.env.CLIENT_URL,       // prod frontend (from env)
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // curl, Postman, etc.

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
app.use('/api', apiLimiter);
app.use("/messages", messagesRoutes);
// Static file serving
app.use("/uploads", express.static("uploads"));

// Health check endpoint (before rate limiting)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

app.get("/", (req, res) => res.json({ message: "API is Running", version: "1.0.0" }));
app.set("trust proxy", 1);
// Apply auth rate limiter to authentication routes
app.use("/auth", authLimiter);
app.use("/auth", authRoutes);

app.use("/user", userRoutes);
app.use("/connect", suggestionsRoute);
app.use("/meetings", meetingRoutes);
app.use('/chat', chatRoutes);
app.use('/subscription', subscriptionRoutes);
app.use('/report', reportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
});

module.exports = app;