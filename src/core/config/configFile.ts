
import * as fs from 'fs';
import * as path from 'path';

export class ConfigFile<T extends object> {
  constructor(private readonly filePath: string) {}

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
}
