
import * as fs from 'fs';
import * as path from 'path';

export abstract class ConfigFile<T extends object> {
  constructor(protected readonly filePath: string) {}

  abstract getDefaultData(): T;

  exists(): boolean {
    return fs.existsSync(this.filePath);
  }

  read(): T | null {
    if (!this.exists()) {
      return null;
    }
    const content = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(content);
  }

  write(data: T): void {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  loadOrCreate(): T {
    const existingData = this.read();
    if (existingData !== null) {
      return existingData;
    }

    const defaultData = this.getDefaultData();
    this.write(defaultData);
    return defaultData;
  }
}
