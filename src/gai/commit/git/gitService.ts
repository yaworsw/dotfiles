import { spawn } from 'child_process';

export class GitService {
  async getStagedChanges(): Promise<string> {
    return new Promise((resolve, reject) => {
      const gitProcess = spawn('git', ['diff', '--cached'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let error = '';

      gitProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      gitProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      gitProcess.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(`Git diff failed with code ${code}: ${error}`));
        }
      });

      gitProcess.on('error', (err) => {
        reject(new Error(`Failed to execute git diff: ${err.message}`));
      });
    });
  }

  async hasStagedChanges(): Promise<boolean> {
    try {
      const changes = await this.getStagedChanges();
      return changes.length > 0;
    } catch (error) {
      return false;
    }
  }

  async commit(message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const gitProcess = spawn('git', ['commit', '-m', message], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let error = '';

      gitProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      gitProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Git commit failed with code ${code}: ${error}`));
        }
      });

      gitProcess.on('error', (err) => {
        reject(new Error(`Failed to execute git commit: ${err.message}`));
      });
    });
  }

  async getProjectRoot(): Promise<string> {
    return new Promise((resolve, reject) => {
      const gitProcess = spawn('git', ['rev-parse', '--show-toplevel'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let error = '';

      gitProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      gitProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      gitProcess.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(`Git rev-parse failed with code ${code}: ${error}`));
        }
      });

      gitProcess.on('error', (err) => {
        reject(new Error(`Failed to get git root: ${err.message}`));
      });
    });
  }

  async isGitRepository(): Promise<boolean> {
    try {
      await this.getProjectRoot();
      return true;
    } catch (error) {
      return false;
    }
  }
}
