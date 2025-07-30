
import { BlogConfig } from './blogConfig';
import { Config } from '../core/config/config';
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';


const config = new BlogConfig();
const coreConfig = new Config();

function getOptions(configData: { lastUsed?: string }): Array<{ label: string; value: string }> {
  const coreConfigData = coreConfig.loadOrCreate();
  const applications = coreConfigData.applications ?? [];
  const lastUsed = configData.lastUsed ?? 'gemini';
  const lastUsedApp = applications.find(app => app.id === lastUsed);
  const lastUsedDisplay = lastUsedApp ? lastUsedApp.name : 'Gemini CLI';


  const options = [
    { label: `Last Used (${lastUsedDisplay})`, value: 'last-used' },
  ];

  // Add all configured applications
  applications.forEach(app => {
    options.push({ label: app.name, value: app.id });
  });

  return options;
}

async function promptForBlogDirectory(): Promise<string> {
  return new Promise((resolve) => {
    (async() => {
    // @ts-ignore - Dynamic imports to avoid TypeScript module resolution issues
      const { render, Box, Text } = await import('ink');
      // @ts-ignore
      const { TextInput } = await import('@inkjs/ui');
      // @ts-ignore
      const React = await import('react');

      const BlogDirectoryPrompt = ({ onComplete }: { onComplete: (path: string) => void }) => {
        const [input, setInput] = React.useState('');
        const [error, setError] = React.useState<string | null>(null);

        const validateAndSubmit = (pathInput: string) => {
          const trimmedPath = pathInput.trim();

          if (!trimmedPath) {
            setError('❌ Please enter a valid path.');
            return;
          }

          // Expand ~ to home directory
          const expandedPath = trimmedPath.startsWith('~')
            ? path.join(process.env.HOME ?? '', trimmedPath.slice(1))
            : trimmedPath;

          // Check if directory exists
          if (!fs.existsSync(expandedPath)) {
            setError('❌ Directory does not exist. Please enter a valid path.');
            return;
          }

          // Check if it's actually a directory
          const stats = fs.statSync(expandedPath);
          if (!stats.isDirectory()) {
            setError('❌ Path is not a directory. Please enter a valid directory path.');
            return;
          }

          // Success - resolve with the path
          onComplete(expandedPath);
        };

        return (
          <Box flexDirection="column" gap={1}>
            <Box flexDirection="column" gap={1}>
              <Text bold color="cyan">📝 Blog Setup Guide</Text>
              <Text color="gray">==================</Text>
              <Text>Please specify the root directory of your blog on your file system.</Text>
              <Text>This should be the folder containing your blog posts, notes, or documentation.</Text>
              <Text></Text>
              <Text bold>Examples:</Text>
              <Text>  - /home/username/blog{'\n'}  - /home/username/Documents/blog{'\n'}  - /home/username/notes</Text>
              <Text></Text>
            </Box>

            <Box flexDirection="column" gap={1}>
              <TextInput
                placeholder="Enter your blog directory path"
                value={input}
                onChange={setInput}
                onSubmit={validateAndSubmit}
              />
              {error && <Text color="red">{error}</Text>}
            </Box>
          </Box>
        );
      };

      const { unmount } = render(
        <BlogDirectoryPrompt
          onComplete={(path: string) => {
            unmount();
            resolve(path);
          }}
        />,
      );
    })();
  });
}

async function runSetupGuide(): Promise<void> {
  return new Promise((resolve) => {
    (async() => {
    // @ts-ignore - Dynamic imports to avoid TypeScript module resolution issues
      const { render, Box, Text } = await import('ink');
      // @ts-ignore
      const React = await import('react');

      const SetupGuide = ({ onComplete }: { onComplete: () => void }) => {
        const [step, setStep] = React.useState<'welcome' | 'prompt' | 'complete'>('welcome');

        React.useEffect(() => {
          const runSetup = async() => {
            setStep('prompt');
            const dir = await promptForBlogDirectory();

            // Create initial config with blog directory
            const initialConfig = {
              lastUsed: 'gemini',
              blogDir: dir,
            };

            config.write(initialConfig);
            setStep('complete');

            // Wait a moment to show success message, then resolve
            setTimeout(() => {
              onComplete();
            }, 2000);
          };

          if (step === 'welcome') {
            runSetup();
          }
        }, [step]);

        if (step === 'welcome') {
          return (
            <Box flexDirection="column" gap={1}>
              <Text bold color="green">🔧 Welcome to the Blog Setup Guide!</Text>
              <Text>This will help you configure your blog functionality.</Text>
            </Box>
          );
        }

        if (step === 'complete') {
          return (
            <Box flexDirection="column" gap={1}>
              <Text color="green">✅ Blog configuration saved successfully!</Text>
              <Text>You can now use the blog command to open your blog directory.</Text>
            </Box>
          );
        }

        return <Text>Loading...</Text>;
      };

      const { unmount } = render(
        <SetupGuide
          onComplete={() => {
            unmount();
            resolve();
          }}
        />,
      );
    })();
  });
}

function getBlogDir(): string {
  const configData = config.loadOrCreate();
  if (!configData?.blogDir) {
    throw new Error('Blog directory not configured. Please run the setup guide.');
  }
  return configData.blogDir;
}

async function selectOption(configData: { lastUsed?: string }): Promise<string> {
  const options = getOptions(configData);

  return new Promise((resolve) => {
    (async() => {
    // @ts-ignore - Dynamic imports to avoid TypeScript module resolution issues
      const { render } = await import('ink');
      // @ts-ignore
      const { Select } = await import('@inkjs/ui');

      const AppSelector = ({ onSelect }: { onSelect: (value: string) => void }) => {
        return (
          <Select
            options={options}
            onChange={onSelect}
          // defaultValue={options[0]?.value}
          />
        );
      };

      const { unmount } = render(
        <AppSelector
          onSelect={(value: string) => {
            unmount();
            resolve(value);
          }}
        />,
      );
    })();
  });
}

async function main() {
  try {
    // Check if config exists and has blog directory
    const configData = config.loadOrCreate();
    if (!configData?.blogDir) {
      await showWarningAndSetup();
      return;
    }

    const lastUsed = configData.lastUsed ?? 'gemini';
    let selection = await selectOption(configData);

    if (selection === 'last-used') {
      selection = lastUsed;
    }

    config.write({ ...configData, lastUsed: selection });

    const blogDir = getBlogDir();

    // Get the selected application
    const applications = coreConfig.loadOrCreate().applications ?? [];
    const selectedApp = applications.find(app => app.id === selection);

    if (!selectedApp) {
      await showError('❌ Selected application not found in configuration.');
      process.exit(1);
    }

    await showStatus(`Opening ${selectedApp.name} with blog directory: ${blogDir}`);

    if (selection === 'gemini') {
      // We can't open a new terminal from here, so we'll just print a message
      await showStatus('Opening Gemini CLI...');
      await showStatus(`Blog directory: ${blogDir}`);
    } else {
      // Execute the command for other applications
      child_process.exec(`${selectedApp.exec} "${blogDir}"`);
    }
  } catch (error) {
    await showError('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function showWarningAndSetup(): Promise<void> {
  return new Promise((resolve) => {
    (async() => {
    // @ts-ignore - Dynamic imports to avoid TypeScript module resolution issues
      const { render, Box, Text } = await import('ink');
      // @ts-ignore
      const React = await import('react');

      const WarningComponent = ({ onComplete }: { onComplete: () => void }) => {
        React.useEffect(() => {
          const showWarning = async() => {
          // Wait a moment to show the warning
            setTimeout(async() => {
              await runSetupGuide();
              onComplete();
            }, 1500);
          };
          showWarning();
        }, []);

        return (
          <Box flexDirection="column" gap={1}>
            <Text color="yellow">⚠️  Blog configuration not found or incomplete.</Text>
          </Box>
        );
      };

      const { unmount } = render(
        <WarningComponent
          onComplete={() => {
            unmount();
            resolve();
          }}
        />,
      );
    })();
  });
}

async function showStatus(message: string): Promise<void> {
  return new Promise((resolve) => {
    (async() => {
    // @ts-ignore - Dynamic imports to avoid TypeScript module resolution issues
      const { render, Box, Text } = await import('ink');
      // @ts-ignore
      const React = await import('react');

      const StatusComponent = ({ message, onComplete }: { message: string; onComplete: () => void }) => {
        React.useEffect(() => {
          setTimeout(() => {
            onComplete();
          }, 1000);
        }, []);

        return (
          <Box flexDirection="column" gap={1}>
            <Text color="cyan">{message}</Text>
          </Box>
        );
      };

      const { unmount } = render(
        <StatusComponent
          message={message}
          onComplete={() => {
            unmount();
            resolve();
          }}
        />,
      );
    })();
  });
}

async function showError(message: string, details?: string): Promise<void> {
  return new Promise((resolve) => {
    (async() => {
    // @ts-ignore - Dynamic imports to avoid TypeScript module resolution issues
      const { render, Box, Text } = await import('ink');
      // @ts-ignore
      const React = await import('react');

      const ErrorComponent = ({ message, details, onComplete }: { message: string; details?: string; onComplete: () => void }) => {
        React.useEffect(() => {
          setTimeout(() => {
            onComplete();
          }, 2000);
        }, []);

        return (
          <Box flexDirection="column" gap={1}>
            <Text color="red">{message}</Text>
            {details && <Text color="red">{details}</Text>}
          </Box>
        );
      };

      const { unmount } = render(
        <ErrorComponent
          message={message}
          details={details}
          onComplete={() => {
            unmount();
            resolve();
          }}
        />,
      );
    })();
  });
}

main();
