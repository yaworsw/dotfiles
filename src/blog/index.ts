
import { BlogConfig } from './blogConfig';
import { Config } from '../core/config/config';
import * as child_process from 'child_process';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';

/* eslint-disable no-console */

const config = new BlogConfig();
const coreConfig = new Config();

function getOptions(configData: { lastUsed?: string }): Array<{ name: string; value: string }> {
  const coreConfigData = coreConfig.loadOrCreate();
  const applications = coreConfigData.applications ?? [];
  const lastUsed = configData.lastUsed ?? 'gemini';
  const lastUsedApp = applications.find(app => app.id === lastUsed);
  const lastUsedDisplay = lastUsedApp ? lastUsedApp.name : 'Gemini CLI';

  const options = [
    { name: `Last Used (${lastUsedDisplay})`, value: 'last-used' },
  ];

  // Add all configured applications
  applications.forEach(app => {
    options.push({ name: app.name, value: app.id });
  });

  return options;
}

async function promptForBlogDirectory(): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n📝 Blog Setup Guide');
    console.log('==================');
    console.log('Please specify the root directory of your blog on your file system.');
    console.log('This should be the folder containing your blog posts, notes, or documentation.');
    console.log('');
    console.log('Examples:');
    console.log('  - /home/username/blog');
    console.log('  - /home/username/Documents/blog');
    console.log('  - /home/username/notes');
    console.log('');


    const askForPath = () => {
      rl.question('Enter your blog directory path: ', (answer: string) => {
        const trimmedPath = answer.trim();

        if (!trimmedPath) {
          console.log('❌ Please enter a valid path.');
          askForPath();
          return;
        }

        // Expand ~ to home directory
        const expandedPath = trimmedPath.startsWith('~')
          ? path.join(process.env.HOME ?? '', trimmedPath.slice(1))
          : trimmedPath;

        // Check if directory exists
        if (!fs.existsSync(expandedPath)) {
          console.log('❌ Directory does not exist. Please enter a valid path.');
          askForPath();
          return;
        }

        // Check if it's actually a directory
        const stats = fs.statSync(expandedPath);
        if (!stats.isDirectory()) {
          console.log('❌ Path is not a directory. Please enter a valid directory path.');
          askForPath();
          return;
        }

        console.log(`✅ Blog directory set to: ${expandedPath}`);
        rl.close();
        resolve(expandedPath);
      });
    };

    askForPath();


  });
}

async function runSetupGuide(): Promise<void> {
  console.log('🔧 Welcome to the Blog Setup Guide!');
  console.log('This will help you configure your blog functionality.');

  const blogDir = await promptForBlogDirectory();

  // Create initial config with blog directory
  const initialConfig = {
    lastUsed: 'gemini',
    blogDir: blogDir,
  };

  config.write(initialConfig);
  console.log('\n✅ Blog configuration saved successfully!');
  console.log('You can now use the blog command to open your blog directory.');
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
  const { selection } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selection',
      message: 'Select an option:',
      choices: options,
    },
  ]);
  return selection;
}

async function main() {
  try {
    // Check if config exists and has blog directory
    const configData = config.loadOrCreate();
    if (!configData?.blogDir) {
      console.log('⚠️  Blog configuration not found or incomplete.');
      await runSetupGuide();
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
      console.error('❌ Selected application not found in configuration.');
      process.exit(1);
    }

    console.log(`Opening ${selectedApp.name} with blog directory: ${blogDir}`);

    if (selection === 'gemini') {
      // We can't open a new terminal from here, so we'll just print a message
      console.log('Opening Gemini CLI...');
      console.log(`Blog directory: ${blogDir}`);
    } else {
      // Execute the command for other applications
      child_process.exec(`${selectedApp.exec} "${blogDir}"`);
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();

/* eslint-enable no-console */
