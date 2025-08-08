import * as fs from 'fs';
import * as path from 'path';
import { ThemeConfig, StyleConfig } from './types.js';

export class ThemeConfigManager {
  constructor(private themesDir: string, private stylesDir: string) {}

  loadTheme(themeName: string): ThemeConfig | null {
    const themePath = path.join(this.themesDir, `${themeName}.json`);
    
    if (!fs.existsSync(themePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(themePath, 'utf8');
      return JSON.parse(content) as ThemeConfig;
    } catch (error) {
      console.error(`Failed to load theme ${themeName}:`, error);
      return null;
    }
  }

  loadStyle(styleName: string): StyleConfig | null {
    const stylePath = path.join(this.stylesDir, `${styleName}.json`);
    
    if (!fs.existsSync(stylePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(stylePath, 'utf8');
      return JSON.parse(content) as StyleConfig;
    } catch (error) {
      console.error(`Failed to load style ${styleName}:`, error);
      return null;
    }
  }

  listThemes(): string[] {
    if (!fs.existsSync(this.themesDir)) {
      return [];
    }

    return fs.readdirSync(this.themesDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.basename(file, '.json'));
  }

  listStyles(): string[] {
    if (!fs.existsSync(this.stylesDir)) {
      return [];
    }

    return fs.readdirSync(this.stylesDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.basename(file, '.json'));
  }

  createDefaultThemes(): void {
    this.createDefaultTheme();
    this.createDefaultStyle();
  }

  private createDefaultTheme(): void {
    const defaultTheme: ThemeConfig = {
      name: 'default',
      description: 'Default conventional commit format',
      template: '{type}({scope}): {description}',
      types: {
        feat: 'feat',
        fix: 'fix',
        docs: 'docs',
        style: 'style',
        refactor: 'refactor',
        test: 'test',
        chore: 'chore'
      }
    };

    const themePath = path.join(this.themesDir, 'default.json');
    if (!fs.existsSync(themePath)) {
      fs.mkdirSync(this.themesDir, { recursive: true });
      fs.writeFileSync(themePath, JSON.stringify(defaultTheme, null, 2));
    }
  }

  private createDefaultStyle(): void {
    const defaultStyle: StyleConfig = {
      name: 'conventional',
      description: 'Conventional commit message style',
      prompts: {
        prefix: 'You are a developer writing a conventional git commit message. ',
        suffix: ' Follow conventional commit format: type(scope): description'
      },
      examples: [
        'feat(auth): add user authentication system',
        'fix(api): resolve undefined error in user endpoint',
        'docs(readme): update installation instructions'
      ]
    };

    const stylePath = path.join(this.stylesDir, 'conventional.json');
    if (!fs.existsSync(stylePath)) {
      fs.mkdirSync(this.stylesDir, { recursive: true });
      fs.writeFileSync(stylePath, JSON.stringify(defaultStyle, null, 2));
    }
  }
}
