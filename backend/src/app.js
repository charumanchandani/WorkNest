import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ENV } from './config/env.js';
import apiRoutes from './routes/index.js';
import { mongoSanitizer } from './middleware/mongoSanitizer.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Production Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Prevents interfering with client-side SPAs / dev proxy
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// Core middlewares
app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NoSQL Query Injection Protection
app.use(mongoSanitizer);

// Root health ping
app.get('/', (req, res) => {
  res.json({
    name: 'WorkNest Backend API',
    status: 'online',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api', apiRoutes);

// 404 Not Found Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;

