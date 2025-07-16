import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class Config {
    private readonly configDir = path.join(os.homedir(), '.alter-ego');

    constructor() {
        this.configDir = path.join(os.homedir(), '.alter-ego');
    }

    getConfigFile(): string {
        return path.join(this.configDir, 'config.json');
    }

    getConfig(): Config {
        const configFile = this.getConfigFile();
        if (!fs.existsSync(configFile)) {
            return new Config();
        }
        const config = fs.readFileSync(configFile, 'utf8');
        return JSON.parse(config);
    }
    
}