import { PromptBuilder, ConversationContext } from './types.js';

export class GeminiPromptBuilder implements PromptBuilder {
  buildPrompt(basePrompt: string, context?: ConversationContext): string {
    let prompt = basePrompt;

    if (context?.messages && context.messages.length > 0) {
      const conversationHistory = context.messages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      
      prompt = `Previous conversation:\n${conversationHistory}\n\nCurrent request:\n${basePrompt}`;
    }

    if (context?.metadata) {
      prompt = this.addContext(prompt, context.metadata);
    }

    return prompt;
  }

  addContext(prompt: string, context: Record<string, any>): string {
    const contextStr = Object.entries(context)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');

    return `Context:\n${contextStr}\n\n${prompt}`;
  }

  buildCommitMessagePrompt(diff: string, style?: string, theme?: string): string {
    let prompt = `Please generate a git commit message for the following changes:\n\n${diff}`;
    
    if (style) {
      prompt += `\n\nUse the following style: ${style}`;
    }
    
    if (theme) {
      prompt += `\n\nApply the following theme: ${theme}`;
    }
    
    prompt += '\n\nProvide only the commit message, no additional text.';
    
    return prompt;
  }
}
