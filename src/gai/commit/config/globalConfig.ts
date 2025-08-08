import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ConfigFile } from '../../../core/config/configFile.js';
import { GlobalConfig } from './types.js';

export class GlobalConfigManager extends ConfigFile<GlobalConfig> {
  constructor() {
    const configDir = path.join(os.homedir(), '.config', 'gaic');
    const configPath = path.join(configDir, 'config.json');
    super(configPath);
  }

  getDefaultData(): GlobalConfig {
    return {
      aiService: {
        type: 'gemini',
        command: 'gemini'
      },
      editor: 'vim',
      defaultStyle: 'conventional',
      defaultTheme: 'default'
    };
  }

  getConfigDir(): string {
    return path.dirname(this.filePath);
  }

  getThemesDir(): string {
    return path.join(this.getConfigDir(), 'themes');
  }

  getStylesDir(): string {
    return path.join(this.getConfigDir(), 'styles');
  }

  ensureConfigDirs(): void {
    const configDir = this.getConfigDir();
    const themesDir = this.getThemesDir();
    const stylesDir = this.getStylesDir();

    fs.mkdirSync(configDir, { recursive: true });
    fs.mkdirSync(themesDir, { recursive: true });
    fs.mkdirSync(stylesDir, { recursive: true });
  }
}
