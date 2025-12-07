const Joi = require('joi');
const logger = require('./logger');

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  MONGODB_URI: Joi.string().required().description('MongoDB connection URI'),
  JWT_SECRET: Joi.string().required().min(32).description('JWT secret key (minimum 32 characters)'),
  CLIENT_URL: Joi.string().uri().required().description('Frontend client URL'),
  FRONTEND_URL: Joi.string().uri().optional().description('Alternative frontend URL'),
  EMAIL: Joi.string().email().required().description('Email address for sending emails'),
  EMAIL_PASSWORD: Joi.string().required().description('Email password or app password'),
  CLOUDINARY_CLOUD_NAME: Joi.string().optional().allow('').description('Cloudinary cloud name'),
  CLOUDINARY_API_KEY: Joi.string().optional().allow('').description('Cloudinary API key'),
  CLOUDINARY_SECRET_KEY: Joi.string().optional().allow('').description('Cloudinary secret key'),
  CLOUDINARY_FOLDER: Joi.string().optional().default('chat_uploads').description('Cloudinary folder'),
  RAZORPAY_KEY_ID: Joi.string().optional().allow('').description('Razorpay key ID'),
  RAZORPAY_KEY_SECRET: Joi.string().optional().allow('').description('Razorpay key secret'),
  RAZORPAY_CURRENCY: Joi.string().optional().default('INR').description('Razorpay currency'),
  INR_TO_USD_RATE: Joi.number().optional().default(82).description('INR to USD conversion rate'),
  BASE_URL: Joi.string().uri().optional().description('Base URL for file serving'),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').optional().description('Logging level'),
}).unknown();

const validateEnv = () => {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message).join(', ');
    logger.error(`Environment validation error: ${errorMessages}`);
    throw new Error(`Environment validation failed: ${errorMessages}`);
  }

  // Set defaults
  process.env.NODE_ENV = value.NODE_ENV;
  process.env.PORT = value.PORT;
  
  logger.info('Environment variables validated successfully');
  return value;
};

module.exports = validateEnv;

