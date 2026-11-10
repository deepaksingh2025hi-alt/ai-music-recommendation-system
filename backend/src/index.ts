import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import aiRoutes from './routes/aiRoutes.js';
import musicRoutes from './routes/musicRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import userRoutes from './routes/userRoutes.js';
import configRoutes from './routes/configRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/ai', aiRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api', userRoutes); // exposes /api/favourites, /api/history, /api/profile
app.use('/api/config', configRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    service: 'AuraPulse AI Music Server',
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server & Connect Database
const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`\n AuraPulse AI Music Backend running on http://localhost:${config.port}`);
    console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Gemini API: ${config.geminiApiKey ? 'Configured' : 'Using Intelligent Fallback'}`);
    console.log(` YouTube API: ${config.youtubeApiKey ? 'Configured' : 'Using Resilient Scraper Fallback'}\n`);
  });
};

startServer().catch((err) => {
  console.error('Failed to bootstrap server:', err);
});

