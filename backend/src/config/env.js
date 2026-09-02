import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/worknest',
  JWT_SECRET: process.env.JWT_SECRET || 'worknest_default_dev_secret_key',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
