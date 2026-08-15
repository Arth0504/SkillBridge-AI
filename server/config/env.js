import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI_TEST;
const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

if (!mongoUri || !jwtSecret || !jwtRefreshSecret) {
  console.error(`❌ CRITICAL CONFIG ERROR: Missing mandatory environment variable (MONGODB_URI/JWT_SECRET/JWT_REFRESH_SECRET)`);
  process.exit(1);
}

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: mongoUri,
  JWT_SECRET: jwtSecret,
  JWT_REFRESH_SECRET: jwtRefreshSecret,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
