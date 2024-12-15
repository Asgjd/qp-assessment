const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const winston = require('winston');
const expressWinston = require('express-winston');
const exampleRoutes = require('./routes/apiRoutes');

const app = express();

// Logger configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/api.log' })
    ],
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Morgan for request-response logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Capture API request and response time
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`);
    });
    next();
});

// Request logging using express-winston
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/requests.log' })
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    ),
    meta: true, // Enable request metadata
    expressFormat: true, // Use default express/morgan format
    colorize: false,
}));

// Routes
app.use('/api/example', exampleRoutes);

// Error logging
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/errors.log' })
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    ),
}));

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'API endpoint not found' });
    next();
});

module.exports = app;