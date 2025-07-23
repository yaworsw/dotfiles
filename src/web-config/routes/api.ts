import express from 'express';
import { Config } from '../../core/config/config';

const router = express.Router();

// API route for config files
router.get('/config-files', (req: express.Request, res: express.Response) => {
  try {
    const configFiles = Config.findConfigFiles();
    res.json(configFiles);
  } catch (error) {
    console.error('Error fetching config files:', error);
    res.status(500).json({ error: 'Failed to fetch config files' });
  }
});

export default router;
