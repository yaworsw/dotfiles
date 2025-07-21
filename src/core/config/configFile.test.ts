import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigFile } from './configFile';

vi.mock('fs');

describe('ConfigFile', () => {
    const mockFilePath = '/mock/config.json';
    let configFile: ConfigFile<{ test: string }>;

    beforeEach(() => {
        vi.clearAllMocks();
        configFile = new ConfigFile(mockFilePath);
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
});