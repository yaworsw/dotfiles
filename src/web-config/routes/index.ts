import express from 'express';
import * as path from 'path';
import apiRoutes from './api';
import compilerRoutes from './compiler';

const router = express.Router();

// API routes
router.use('/api', apiRoutes);

// JIT compilation routes
router.use('/client', compilerRoutes);

// Serve the main HTML file for all other routes (SPA)
router.get('*', (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

export default router;
