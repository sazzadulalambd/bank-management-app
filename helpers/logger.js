
const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [
    new transports.Console(), // Log to console
    new transports.File({ filename: path.join(__dirname, '../logs/app.log'), level: 'info' }) // Log to file
  ],
});

module.exports = logger;
