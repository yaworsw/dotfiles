import express from 'express';
import * as path from 'path';
import cors from 'cors';
import routes from './routes';

export class WebConfigServer {
  private app: express.Application;
  private port: number;

  constructor(port = 3000) {
    this.port = port;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Enable CORS for development
    this.app.use(cors());

    // Parse JSON bodies
    this.app.use(express.json());

    // Serve static files from public directory
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  private setupRoutes(): void {
    // Use the aggregated routes
    this.app.use('/', routes);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Web Config Server running at http://localhost:${this.port}`);
      console.log(`📁 Config files API: http://localhost:${this.port}/api/config-files`);
      console.log(`⚡ JIT compilation: http://localhost:${this.port}/client/`);
    });
  }
}
