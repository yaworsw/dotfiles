import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Config } from './config';

// Mock fs and os modules
vi.mock('fs');
vi.mock('os');

describe('Config', () => {
    let config: Config;
    let mockHomedir: string;
    let mockConfigDir: string;
    let mockConfigFile: string;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();
        
        // Setup mock values
        mockHomedir = '/mock/home';
        mockConfigDir = path.join(mockHomedir, '.alter-ego');
        mockConfigFile = path.join(mockConfigDir, 'config.json');
        
        // Mock os.homedir()
        vi.mocked(os.homedir).mockReturnValue(mockHomedir);
        
        // Mock fs.existsSync
        vi.mocked(fs.existsSync).mockReturnValue(false);
        
        // Mock fs.readFileSync
        vi.mocked(fs.readFileSync).mockReturnValue('{}');
        
        config = new Config();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with correct config directory', () => {
            expect(config).toBeInstanceOf(Config);
        });
    });

    describe('getConfigFile', () => {
        it('should return the correct config file path', () => {
            const configFile = config.getConfigFile();
            expect(configFile).toBe(mockConfigFile);
        });

        it('should use the correct home directory', () => {
            config.getConfigFile();
            expect(os.homedir).toHaveBeenCalledTimes(1);
        });
    });

    describe('getConfig', () => {
        it('should return default config when config file does not exist', () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);
            
            const result = config.getConfig();
            
            expect(fs.existsSync).toHaveBeenCalledWith(mockConfigFile);
            expect(fs.readFileSync).not.toHaveBeenCalled();
            expect(result).toEqual({});
        });

        it('should read and parse config file when it exists', () => {
            const mockConfigData = { theme: 'dark', language: 'en' };
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfigData));
            
            const result = config.getConfig();
            
            expect(fs.existsSync).toHaveBeenCalledWith(mockConfigFile);
            expect(fs.readFileSync).toHaveBeenCalledWith(mockConfigFile, 'utf8');
            expect(result).toEqual(mockConfigData);
        });

        it('should handle empty config file', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue('');
            
            const result = config.getConfig();
            
            expect(result).toEqual({});
        });

        it('should handle whitespace-only config file', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue('   \n\t  ');
            
            const result = config.getConfig();
            
            expect(result).toEqual({});
        });

        it('should throw error for invalid JSON', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue('{ invalid json }');
            
            expect(() => config.getConfig()).toThrow();
        });

        it('should handle file read errors', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockImplementation(() => {
                throw new Error('File read error');
            });
            
            expect(() => config.getConfig()).toThrow('File read error');
        });

        it('should handle complex nested config objects', () => {
            const complexConfig = {
                user: {
                    name: 'test',
                    preferences: {
                        theme: 'dark',
                        notifications: true
                    }
                },
                settings: {
                    autoSave: true,
                    timeout: 5000
                }
            };
            
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(complexConfig));
            
            const result = config.getConfig();
            
            expect(result).toEqual(complexConfig);
        });
    });

    describe('integration tests', () => {
        it('should work with real path operations', () => {
            // Test with actual path operations (without mocking path)
            const testConfig = new Config();
            const configFile = testConfig.getConfigFile();
            
            expect(configFile).toContain('.alter-ego');
            expect(configFile).toContain('config.json');
        });

        it('should handle different home directory paths', () => {
            const testHomedir = '/custom/home/directory';
            vi.mocked(os.homedir).mockReturnValue(testHomedir);
            
            const testConfig = new Config();
            const configFile = testConfig.getConfigFile();
            
            expect(configFile).toBe(path.join(testHomedir, '.alter-ego', 'config.json'));
        });
    });
}); 