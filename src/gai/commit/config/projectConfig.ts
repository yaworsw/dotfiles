import * as fs from 'fs';
import * as path from 'path';
import { ConfigFile } from '../../../core/config/configFile.js';
import { ProjectConfig } from './types.js';

export class ProjectConfigManager extends ConfigFile<ProjectConfig> {
  constructor(projectRoot: string) {
    const configPath = path.join(projectRoot, '.gaic.json');
    super(configPath);
  }

  getDefaultData(): ProjectConfig {
    return {};
  }

  exists(): boolean {
    return fs.existsSync(this.filePath);
  }

  loadOrEmpty(): ProjectConfig {
    const existingData = this.read();
    return existingData || this.getDefaultData();
  }
}
