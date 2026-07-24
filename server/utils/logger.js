import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { env } from '../config/env.js';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(logColors);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level}] ${info.requestId ? `[${info.requestId}]` : ''}: ${info.message}`
  )
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const dailyRotateError = new winston.transports.DailyRotateFile({
  filename: path.join('logs', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  zippedArchive: true,
  format: fileFormat,
});

const dailyRotateCombined = new winston.transports.DailyRotateFile({
  filename: path.join('logs', 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  zippedArchive: true,
  format: fileFormat,
});

const dailyRotateHttp = new winston.transports.DailyRotateFile({
  filename: path.join('logs', 'http-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'http',
  maxSize: '20m',
  maxFiles: '30d',
  zippedArchive: true,
  format: fileFormat,
});

const transports = [
  new winston.transports.Console({
    format: env.NODE_ENV === 'production' ? fileFormat : consoleFormat,
  }),
  dailyRotateError,
  dailyRotateCombined,
  dailyRotateHttp,
];

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels: logLevels,
  transports,
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join('logs', 'exceptions.log') }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join('logs', 'rejections.log') }),
  ],
});
