
import * as path from 'path';
import * as os from 'os';
import { ConfigFile } from './configFile';

interface ConfigData {
    theme: string;
    language: string;
}

export class Config extends ConfigFile<ConfigData> {
    constructor() {
        super(path.join(os.homedir(), '.alter-ego', 'config.json'));
    }
}
