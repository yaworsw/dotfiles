import { spawn } from 'child_process';
import { AIService, ConversationContext } from './types.js';
import { GeminiPromptBuilder } from './promptBuilder.js';

export class GeminiService implements AIService {
  private promptBuilder: GeminiPromptBuilder;

  constructor() {
    this.promptBuilder = new GeminiPromptBuilder();
  }

  async generateResponse(prompt: string, context?: ConversationContext): Promise<string> {
    const fullPrompt = this.promptBuilder.buildPrompt(prompt, context);
    
    return new Promise((resolve, reject) => {
      const geminiProcess = spawn('gemini', [], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let error = '';

      geminiProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      geminiProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      geminiProcess.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(`Gemini process failed with code ${code}: ${error}`));
        }
      });

      geminiProcess.on('error', (err) => {
        reject(new Error(`Failed to start Gemini process: ${err.message}`));
      });

      // Send the prompt to Gemini
      geminiProcess.stdin.write(fullPrompt);
      geminiProcess.stdin.end();
    });
  }

  getServiceName(): string {
    return 'gemini';
  }

  async generateCommitMessage(diff: string, style?: string, theme?: string): Promise<string> {
    const prompt = this.promptBuilder.buildCommitMessagePrompt(diff, style, theme);
    return this.generateResponse(prompt);
  }
}
