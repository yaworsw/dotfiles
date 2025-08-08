import React, { useState, useEffect } from 'react';
import { render, Box, Text, Newline } from 'ink';
import { GitService } from './git/gitService.js';
import { GlobalConfigManager } from './config/globalConfig.js';
import { ProjectConfigManager } from './config/projectConfig.js';
import { ThemeConfigManager } from './config/themeConfig.js';
import { GeminiService } from '../../core/ai/geminiService.js';
import { InMemoryConversationManager } from '../../core/ai/conversationManager.js';
import { CommitOptions } from './ui/CommitOptions.js';
import { CommitMessageEditor } from './ui/CommitMessageEditor.js';
import { AIFeedback } from './ui/AIFeedback.js';

interface AppState {
  stage: 'loading' | 'error' | 'no-changes' | 'generating' | 'options' | 'editing' | 'feedback' | 'committing';
  error?: string;
  stagedChanges?: string;
  commitMessage?: string;
  config?: any;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({ stage: 'loading' });
  const [conversationManager] = useState(() => new InMemoryConversationManager());
  const [aiService] = useState(() => new GeminiService());

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if we're in a git repository
      const gitService = new GitService();
      const isGitRepo = await gitService.isGitRepository();
      
      if (!isGitRepo) {
        setState({ stage: 'error', error: 'Not in a git repository' });
        return;
      }

      // Check for staged changes
      const hasChanges = await gitService.hasStagedChanges();
      if (!hasChanges) {
        setState({ stage: 'no-changes' });
        return;
      }

      // Load configuration
      const globalConfig = new GlobalConfigManager();
      globalConfig.ensureConfigDirs();
      const global = globalConfig.loadOrCreate();

      const projectRoot = await gitService.getProjectRoot();
      const projectConfig = new ProjectConfigManager(projectRoot);
      const project = projectConfig.exists() ? projectConfig.loadOrEmpty() : {};

      const themeManager = new ThemeConfigManager(
        globalConfig.getThemesDir(),
        globalConfig.getStylesDir()
      );
      themeManager.createDefaultThemes();

      const style = project.style || global.defaultStyle;
      const theme = project.theme || global.defaultTheme;

      const styleConfig = themeManager.loadStyle(style);
      const themeConfig = themeManager.loadTheme(theme);

      const config = {
        global,
        project,
        style: styleConfig,
        theme: themeConfig
      };

      // Get staged changes
      const stagedChanges = await gitService.getStagedChanges();
      
      setState({ 
        stage: 'generating', 
        stagedChanges, 
        config 
      });

      // Generate initial commit message
      await generateCommitMessage(stagedChanges, config);

    } catch (error) {
      setState({ 
        stage: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const generateCommitMessage = async (diff: string, config: any) => {
    try {
      const style = config.style?.name || 'conventional';
      const theme = config.theme?.name || 'default';
      
      const message = await aiService.generateCommitMessage(diff, style, theme);
      
      conversationManager.addMessage('assistant', message);
      
      setState(prev => ({ 
        ...prev, 
        stage: 'options', 
        commitMessage: message 
      }));
    } catch (error) {
      setState({ 
        stage: 'error', 
        error: error instanceof Error ? error.message : 'Failed to generate commit message' 
      });
    }
  };

  const handleOptionSelect = async (option: string) => {
    switch (option) {
      case 'commit':
        setState(prev => ({ ...prev, stage: 'committing' }));
        await commitChanges();
        break;
      case 'edit':
        setState(prev => ({ ...prev, stage: 'editing' }));
        break;
      case 'feedback':
        setState(prev => ({ ...prev, stage: 'feedback' }));
        break;
      case 'cancel':
        process.exit(0);
        break;
    }
  };

  const commitChanges = async () => {
    try {
      const gitService = new GitService();
      await gitService.commit(state.commitMessage!);
      process.exit(0);
    } catch (error) {
      setState({ 
        stage: 'error', 
        error: error instanceof Error ? error.message : 'Failed to commit changes' 
      });
    }
  };

  const handleMessageEdit = (newMessage: string) => {
    setState(prev => ({ 
      ...prev, 
      commitMessage: newMessage,
      stage: 'options' 
    }));
  };

  const handleAIFeedback = async (feedback: string) => {
    try {
      conversationManager.addMessage('user', feedback);
      
      const prompt = `The user provided feedback on the commit message: "${feedback}". Please generate a new commit message based on this feedback.`;
      const newMessage = await aiService.generateResponse(prompt, conversationManager.getContext());
      
      conversationManager.addMessage('assistant', newMessage);
      
      setState(prev => ({ 
        ...prev, 
        commitMessage: newMessage,
        stage: 'options' 
      }));
    } catch (error) {
      setState({ 
        stage: 'error', 
        error: error instanceof Error ? error.message : 'Failed to process AI feedback' 
      });
    }
  };

  if (state.stage === 'loading') {
    return (
      <Box>
        <Text>Loading...</Text>
      </Box>
    );
  }

  if (state.stage === 'error') {
    return (
      <Box>
        <Text color="red">Error: {state.error}</Text>
      </Box>
    );
  }

  if (state.stage === 'no-changes') {
    return (
      <Box>
        <Text color="yellow">No staged changes found.</Text>
        <Newline />
        <Text>Use `git add` to stage changes before running gaic.</Text>
      </Box>
    );
  }

  if (state.stage === 'generating') {
    return (
      <Box>
        <Text>Generating commit message...</Text>
      </Box>
    );
  }

  if (state.stage === 'options' && state.commitMessage) {
    return (
      <CommitOptions
        commitMessage={state.commitMessage}
        onOptionSelect={handleOptionSelect}
      />
    );
  }

  if (state.stage === 'editing' && state.commitMessage) {
    return (
      <CommitMessageEditor
        commitMessage={state.commitMessage}
        onSave={handleMessageEdit}
        onCancel={() => setState(prev => ({ ...prev, stage: 'options' }))}
      />
    );
  }

  if (state.stage === 'feedback') {
    return (
      <AIFeedback
        onFeedback={handleAIFeedback}
        onCancel={() => setState(prev => ({ ...prev, stage: 'options' }))}
      />
    );
  }

  if (state.stage === 'committing') {
    return (
      <Box>
        <Text>Committing changes...</Text>
      </Box>
    );
  }

  return null;
};

render(<App />);
