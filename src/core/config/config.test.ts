import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Config } from './config';

vi.mock('fs');
vi.mock('os');

describe('Config', () => {
  const mockHomedir = '/mock/home';
  const mockDotfilesDir = path.join(mockHomedir, '.dotfiles');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(os.homedir).mockReturnValue(mockHomedir);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('findConfigFiles', () => {
    it('should return empty config files when .dotfiles directory does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = Config.findConfigFiles();

      expect(result).toEqual({ 'config-files': {} });
      expect(fs.existsSync).toHaveBeenCalledWith(mockDotfilesDir);
    });

    it('should find config files in .dotfiles directory', () => {
      const mockConfigContent = { theme: 'dark', language: 'en' };
      const mockBlogConfigContent = { lastUsed: 'obsidian' };

      // Mock directory structure
      vi.mocked(fs.existsSync).mockImplementation((filePath) => {
        return filePath === mockDotfilesDir ||
               filePath === path.join(mockDotfilesDir, 'blog') ||
               filePath === path.join(mockDotfilesDir, 'config.json') ||
               filePath === path.join(mockDotfilesDir, 'blog', 'config.json');
      });

      vi.mocked(fs.readdirSync).mockImplementation((dir) => {
        if (dir === mockDotfilesDir) {
          return ['config.json', 'blog'] as any;
        }
        if (dir === path.join(mockDotfilesDir, 'blog')) {
          return ['config.json'] as any;
        }
        return [] as any;
      });

      vi.mocked(fs.statSync).mockImplementation((filePath) => {
        const isDirectory = filePath === path.join(mockDotfilesDir, 'blog');
        return {
          isDirectory: () => isDirectory,
        } as fs.Stats;
      });

      vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (filePath === path.join(mockDotfilesDir, 'config.json')) {
          return JSON.stringify(mockConfigContent);
        }
        if (filePath === path.join(mockDotfilesDir, 'blog', 'config.json')) {
          return JSON.stringify(mockBlogConfigContent);
        }
        return '';
      });

      const result = Config.findConfigFiles();

      expect(result).toEqual({
        'config-files': {
          'config.json': {
            path: path.join(mockDotfilesDir, 'config.json'),
            content: mockConfigContent,
          },
          'blog/config.json': {
            path: path.join(mockDotfilesDir, 'blog', 'config.json'),
            content: mockBlogConfigContent,
          },
        },
      });
    });

    it('should handle invalid JSON files gracefully', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue(['invalid.json'] as any);
      vi.mocked(fs.statSync).mockReturnValue({
        isDirectory: () => false,
      } as fs.Stats);
      vi.mocked(fs.readFileSync).mockReturnValue('invalid json content');

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = Config.findConfigFiles();

      expect(result).toEqual({ 'config-files': {} });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not parse JSON file'),
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it('should handle directory read errors gracefully', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = Config.findConfigFiles();

      expect(result).toEqual({ 'config-files': {} });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not read directory'),
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });
});
