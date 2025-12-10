const logger = require("../utils/logger");

const allowedOrigins = [
  "http://localhost:5173",   // dev frontend
  process.env.CLIENT_URL,   // prod frontend
  process.env.FRONTEND_URL, // alternative frontend
].filter(Boolean);

const normalizedOrigins = allowedOrigins.map(origin =>
  origin.replace(/\/$/, "").toLowerCase()
);

logger.info(`CORS configuration - Allowed origins: ${normalizedOrigins.join(", ")}`);

module.exports = normalizedOrigins;
