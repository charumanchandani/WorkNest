import app from './src/app.js';
import { ENV } from './src/config/env.js';
import { connectDB } from './src/config/db.js';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Start HTTP Server
  app.listen(ENV.PORT, () => {
    console.log(`[WorkNest Server] Server running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
    console.log(`[WorkNest Server] Health check available at: http://localhost:${ENV.PORT}/api/health`);
  });
};

startServer();
