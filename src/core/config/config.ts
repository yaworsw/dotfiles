
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
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

interface ConfigFileInfo {
  path: string;
  content: any;
}

interface ConfigFilesResponse {
  'config-files': Record<string, ConfigFileInfo>;
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

  /**
   * Recursively finds all JSON config files in the .dotfiles directory
   */
  static findConfigFiles(): ConfigFilesResponse {
    const dotfilesDir = path.join(os.homedir(), '.dotfiles');
    const configFiles: Record<string, ConfigFileInfo> = {};

    if (!fs.existsSync(dotfilesDir)) {
      return { 'config-files': configFiles };
    }

    function scanDirectory(dir: string, relativePath = ''): void {
      try {
        const items = fs.readdirSync(dir);

        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stats = fs.statSync(fullPath);

          if (stats.isDirectory()) {
            // Recursively scan subdirectories
            const newRelativePath = relativePath ? path.join(relativePath, item) : item;
            scanDirectory(fullPath, newRelativePath);
          } else if (item.endsWith('.json')) {
            // Found a JSON file
            try {
              const content = fs.readFileSync(fullPath, 'utf8');
              const parsedContent = JSON.parse(content);

              // Create the key based on relative path
              const key = relativePath ? `${relativePath}/${item}` : item;
              configFiles[key] = {
                path: fullPath,
                content: parsedContent,
              };
            } catch (error) {
              // Skip files that can't be parsed as JSON
              console.warn(`Warning: Could not parse JSON file ${fullPath}:`, error);
            }
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not read directory ${dir}:`, error);
      }
    }

    scanDirectory(dotfilesDir);
    return { 'config-files': configFiles };
  }
}
