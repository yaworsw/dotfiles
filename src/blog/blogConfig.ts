
import * as path from 'path';
import * as os from 'os';
import { ConfigFile } from '../core/config/configFile';

interface BlogConfigData {
    lastUsed: string;
    blogDir?: string;
}

export class BlogConfig extends ConfigFile<BlogConfigData> {
  constructor() {
    super(path.join(os.homedir(), '.config', 'blog', 'config.json'));
  }

  getDefaultData(): BlogConfigData {
    return {
      lastUsed: 'gemini',
    };
  }
}
