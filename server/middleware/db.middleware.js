import mongoose from 'mongoose';
import { sendResponse } from '../utils/sendResponse.js';

export const checkDbConnection = (_req, res, next) => {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    return sendResponse(
      res,
      503,
      false,
      'Database connection unavailable. Please check MONGODB_URI credentials in server/.env',
      null,
      { readyState: mongoose.connection.readyState }
    );
  }
  next();
};
