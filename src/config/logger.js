import winston from 'winston';
import 'winston-daily-rotate-file';
const { format } = winston
// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define Winston format

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

const logger = winston.createLogger({
  // Log level hierarchy: error > warn > info > verbose > debug > silly
  //level: process.env.LOG_LEVEL || 'info',
  level: 'debug',
  
  format: logFormat,
  
  transports: [
    // Console transport for Heroku log drain
    new winston.transports.Console({
      stderrLevels: ['error'],
    })
  ]
});

export default logger;