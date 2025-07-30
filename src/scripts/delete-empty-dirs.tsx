import * as fs from 'fs';
import * as path from 'path';

interface DeleteEmptyDirsOptions {
  targetPath: string;
  dryRun: boolean;
  skipConfirmation: boolean;
  includeGit: boolean;
}

function parseArguments(): DeleteEmptyDirsOptions {
  const args = process.argv.slice(2);
  let targetPath = process.cwd();
  let dryRun = false;
  let skipConfirmation = false;
  let includeGit = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-y' || arg === '--yes') {
      skipConfirmation = true;
    } else if (arg === '-D' || arg === '--dry-run' || arg === '--dry') {
      dryRun = true;
    } else if (arg === '--include-git') {
      includeGit = true;
    } else if (!arg.startsWith('-')) {
      // This is the path argument
      targetPath = path.resolve(arg);
    }
  }

  return { targetPath, dryRun, skipConfirmation, includeGit };
}

function showHelp(): void {
  console.log(`
Usage: delete-empty-dirs [options] [path]

Options:
  -y, --yes           Skip confirmation prompt
  -D, --dry-run       Show what would be deleted without actually deleting
  --include-git       Include .git directories in deletion (default: skip .git dirs)
  -h, --help          Show this help message

Arguments:
  path                Directory to scan (default: current directory)

Examples:
  delete-empty-dirs                    # Scan current directory, require confirmation
  delete-empty-dirs /path/to/dir       # Scan specific directory, require confirmation
  delete-empty-dirs -y                 # Scan current directory, no confirmation
  delete-empty-dirs -D /path/to/dir    # Dry run on specific directory
  delete-empty-dirs -y -D              # Dry run with no confirmation
  delete-empty-dirs --include-git      # Include .git directories in deletion
`);
  process.exit(0);
}

function findEmptyDirectories(dirPath: string, includeGit = false): string[] {
  const emptyDirs: string[] = [];

  function scanDirectory(currentPath: string): boolean {
    try {
      const items = fs.readdirSync(currentPath);

      if (items.length === 0) {
        // Directory is empty
        emptyDirs.push(currentPath);
        return true;
      }

      let hasNonEmptySubdirs = false;

      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          // Skip .git directories unless includeGit is true
          if (item === '.git' && !includeGit) {
            // Skip .git directory - treat as if it doesn't exist
            continue;
          }

          const subdirIsEmpty = scanDirectory(itemPath);
          if (!subdirIsEmpty) {
            hasNonEmptySubdirs = true;
          }
        } else {
          // Found a file, so this directory is not empty
          hasNonEmptySubdirs = true;
        }
      }

      if (!hasNonEmptySubdirs) {
        // All subdirectories are empty, so this directory is effectively empty
        emptyDirs.push(currentPath);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error scanning directory ${currentPath}:`, error);
      return false;
    }
  }

  scanDirectory(dirPath);
  return emptyDirs;
}

async function confirmDeletion(emptyDirs: string[], dryRun: boolean): Promise<boolean> {
  return new Promise((resolve) => {
    (async() => {
      const { render, Box, Text } = await import('ink');
      const { ConfirmInput } = await import('@inkjs/ui');
      const React = await import('react');

      const ConfirmationComponent = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => {
        const action = dryRun ? 'would be found' : 'will be deleted';
        return (
          <Box flexDirection="column" gap={1}>
            <Text bold color="yellow">
              {dryRun ? '🔍 Dry Run Mode' : '⚠️  Confirmation Required'}
            </Text>
            <Text>
              Found {emptyDirs.length} empty director{emptyDirs.length === 1 ? 'y' : 'ies'} that {action}:
            </Text>
            <Box flexDirection="column" gap={0}>
              {emptyDirs.map((dir, index) => (
                <Text key={index} color="gray">  • {dir}</Text>
              ))}
            </Box>
            <Text></Text>
            <ConfirmInput
              onConfirm={onConfirm}
              onCancel={onCancel}
              message={dryRun ? 'Show empty directories?' : 'Proceed with deletion?'}
            />
          </Box>
        );
      };

      const { unmount } = render(
        <ConfirmationComponent
          onConfirm={() => {
            unmount();
            resolve(true);
          }}
          onCancel={() => {
            unmount();
            resolve(false);
          }}
        />,
      );
    })();
  });
}

async function showStatus(message: string, duration = 0): Promise<void> {
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
          }, duration);
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
          }, 0);
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

async function main() {
  try {
    // Check for help flag first
    const args = process.argv.slice(2);
    if (args.includes('-h') || args.includes('--help')) {
      showHelp();
      process.exit(0);
    }

    const options = parseArguments();

    // Validate target path
    if (!fs.existsSync(options.targetPath)) {
      await showError('❌ Error: Target path does not exist', options.targetPath);
      process.exit(1);
    }

    const stats = fs.statSync(options.targetPath);
    if (!stats.isDirectory()) {
      await showError('❌ Error: Target path is not a directory', options.targetPath);
      process.exit(1);
    }

    await showStatus(`🔍 Scanning directory: ${options.targetPath}`);

    if (!options.includeGit) {
      await showStatus('🔒 Skipping .git directories (use --include-git to include them)');
    }

    const emptyDirs = findEmptyDirectories(options.targetPath, options.includeGit);

    if (emptyDirs.length === 0) {
      await showStatus('✅ No empty directories found.');
      return;
    }

    // If dry run mode, just show what would be deleted
    if (options.dryRun) {
      await showStatus(`🔍 Found ${emptyDirs.length} empty director${emptyDirs.length === 1 ? 'y' : 'ies'}:`);
      for (const dir of emptyDirs) {
        console.log(`  • ${dir}`);
      }
      return;
    }

    // If skip confirmation is not set, ask for confirmation
    if (!options.skipConfirmation) {
      const confirmed = await confirmDeletion(emptyDirs, false);
      if (!confirmed) {
        await showStatus('❌ Operation cancelled.');
        return;
      }
    }

    // Delete the empty directories
    let deletedCount = 0;
    for (const dir of emptyDirs) {
      try {
        fs.rmdirSync(dir);
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting directory ${dir}:`, error);
      }
    }

    await showStatus(`✅ Successfully deleted ${deletedCount} empty director${deletedCount === 1 ? 'y' : 'ies'}.`);

  } catch (error) {
    await showError('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
