import { ConversationManager, ConversationContext, ConversationMessage } from './types.js';

export class InMemoryConversationManager implements ConversationManager {
  private messages: ConversationMessage[] = [];
  private metadata: Record<string, any> = {};

  addMessage(role: 'user' | 'assistant' | 'system', content: string): void {
    this.messages.push({
      role,
      content,
      timestamp: new Date()
    });
  }

  getContext(): ConversationContext {
    return {
      messages: [...this.messages],
      metadata: { ...this.metadata }
    };
  }

  clearContext(): void {
    this.messages = [];
    this.metadata = {};
  }

  getMessages(): ConversationMessage[] {
    return [...this.messages];
  }

  setMetadata(key: string, value: any): void {
    this.metadata[key] = value;
  }

  getMetadata(key: string): any {
    return this.metadata[key];
  }

  getRecentMessages(count: number = 10): ConversationMessage[] {
    return this.messages.slice(-count);
  }
}
