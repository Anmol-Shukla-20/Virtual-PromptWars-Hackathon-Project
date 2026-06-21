import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import trackerRoutes from './routes/tracker.routes';

dotenv.config();

const app = express();

import path from 'path';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend-html')));

// Basic health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'EcoPath AI Backend is running' });
});

import aiRoutes from './routes/ai.routes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracker', trackerRoutes);
app.use('/api/ai', aiRoutes);

export default app;
