import express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import * as esbuild from 'esbuild';

const router = express.Router();

// JIT compilation route for TypeScript/TSX files
router.get('/*', async(req: express.Request, res: express.Response) => {
  try {
    const requestedPath = req.params[0];
    const clientDir = path.join(__dirname, '..', 'client');
    const filePath = path.join(clientDir, requestedPath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Only compile TypeScript/TSX files
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
      return res.status(400).json({ error: 'Only TypeScript files can be compiled' });
    }

    // Use esbuild to bundle the file with its dependencies
    const result = await esbuild.build({
      entryPoints: [filePath],
      bundle: true,
      write: false,
      format: 'esm',
      target: 'es2020',
      jsx: 'automatic',
      sourcemap: 'inline',
      platform: 'browser',
      external: [], // Bundle all dependencies
      define: {
        'process.env.NODE_ENV': '"development"',
      },
    });

    // Check for compilation errors
    if (result.errors && result.errors.length > 0) {
      console.error('Compilation errors:', result.errors);
      return res.status(500).json({
        error: 'Compilation failed',
        errors: result.errors,
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache');

    // Send bundled JavaScript
    res.send(result.outputFiles?.[0]?.text || '');
  } catch (error) {
    console.error('Error compiling file:', error);
    res.status(500).json({ error: 'Compilation failed' });
  }
});

export default router;
