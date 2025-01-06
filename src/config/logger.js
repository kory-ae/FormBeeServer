import winston from 'winston';
import 'winston-daily-rotate-file';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define Winston format
const format = winston.format.printf(({ level, message, timestamp }) => {
  // Heroku timestamps are automatically added, so we don't need to include them
  return `${level}: ${message}`;
});

const logger = winston.createLogger({
  // Log level hierarchy: error > warn > info > verbose > debug > silly
  level: process.env.LOG_LEVEL || 'info',
  
  // Use Heroku-friendly format
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.simple(),
    format
  ),
  
  transports: [
    // Console transport for Heroku log drain
    new winston.transports.Console({
      stderrLevels: ['error'],
    })
  ]
});

export default logger;