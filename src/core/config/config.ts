
import * as path from 'path';
import * as os from 'os';
import { ConfigFile } from './configFile';

interface Application {
  id: string;
  name: string;
  exec: string;
}

interface ConfigData {
  theme: string;
  language: string;
  applications: Application[];
}

export class Config extends ConfigFile<ConfigData> {
  constructor() {
    super(path.join(os.homedir(), '.dotfiles', 'config.json'));
  }

  getDefaultData(): ConfigData {
    return {
      theme: 'default',
      language: 'en',
      applications: [
        {
          id: 'gemini',
          name: 'Gemini CLI',
          exec: 'gemini',
        },
        {
          id: 'cursor',
          name: 'Cursor',
          exec: 'cursor',
        },
        {
          id: 'obsidian',
          name: 'Obsidian',
          exec: 'obsidian',
        },
      ],
    };
  }
}
