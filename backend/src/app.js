import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Core middlewares
app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
