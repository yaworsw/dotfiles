export interface AIService {
  generateResponse(prompt: string, context?: ConversationContext): Promise<string>;
  getServiceName(): string;
}

export interface ConversationContext {
  messages: ConversationMessage[];
  metadata?: Record<string, any>;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface PromptBuilder {
  buildPrompt(basePrompt: string, context?: ConversationContext): string;
  addContext(prompt: string, context: Record<string, any>): string;
}

export interface ConversationManager {
  addMessage(role: 'user' | 'assistant' | 'system', content: string): void;
  getContext(): ConversationContext;
  clearContext(): void;
  getMessages(): ConversationMessage[];
}
