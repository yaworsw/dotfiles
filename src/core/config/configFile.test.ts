import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigFile } from './configFile';

vi.mock('fs');

// Create a concrete implementation for testing
class TestConfigFile extends ConfigFile<{ test: string }> {
  getDefaultData(): { test: string } {
    return { test: 'default' };
  }
}

describe('ConfigFile', () => {
  const mockFilePath = '/mock/config.json';
  let configFile: TestConfigFile;

  beforeEach(() => {
    vi.clearAllMocks();
    configFile = new TestConfigFile(mockFilePath);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exists', () => {
    it('should return true if file exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      expect(configFile.exists()).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith(mockFilePath);
    });

    it('should return false if file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      expect(configFile.exists()).toBe(false);
    });
  });

  describe('read', () => {
    it('should return null if file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      expect(configFile.read()).toBeNull();
    });

    it('should read and parse the file if it exists', () => {
      const mockData = { test: 'data' };
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockData));
      expect(configFile.read()).toEqual(mockData);
      expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf8');
    });
  });

  describe('write', () => {
    it('should write data to the file', () => {
      const mockData = { test: 'data' };
      configFile.write(mockData);
      expect(fs.mkdirSync).toHaveBeenCalledWith(path.dirname(mockFilePath), { recursive: true });
      expect(fs.writeFileSync).toHaveBeenCalledWith(mockFilePath, JSON.stringify(mockData, null, 2));
    });
  });

  describe('loadOrCreate', () => {
    it('should return existing data if file exists', () => {
      const mockData = { test: 'existing' };
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockData));

      const result = configFile.loadOrCreate();

      expect(result).toEqual(mockData);
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should create file with default data if file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = configFile.loadOrCreate();

      expect(result).toEqual({ test: 'default' });
      expect(fs.mkdirSync).toHaveBeenCalledWith(path.dirname(mockFilePath), { recursive: true });
      expect(fs.writeFileSync).toHaveBeenCalledWith(mockFilePath, JSON.stringify({ test: 'default' }, null, 2));
    });

    it('should return default data after creating file', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = configFile.loadOrCreate();

      expect(result).toEqual({ test: 'default' });
    });
  });
});
