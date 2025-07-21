
import { BlogConfig } from './blogConfig';
import * as child_process from 'child_process';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

const config = new BlogConfig();

const options = [
    { name: 'Last Used', value: 'last-used' },
    { name: 'Gemini CLI', value: 'gemini' },
    { name: 'Cursor', value: 'cursor' },
    { name: 'Obsidian', value: 'obsidian' },
];

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
                    ? path.join(process.env.HOME || '', trimmedPath.slice(1))
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
        blogDir: blogDir
    };
    
    config.write(initialConfig);
    console.log('\n✅ Blog configuration saved successfully!');
    console.log('You can now use the blog command to open your blog directory.');
}

function getBlogDir(): string {
    const configData = config.read();
    if (!configData || !configData.blogDir) {
        throw new Error('Blog directory not configured. Please run the setup guide.');
    }
    return configData.blogDir;
}

async function selectOption(): Promise<string> {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        console.log('Select an option:');
        options.forEach((option, index) => {
            console.log(`${index + 1}. ${option.name}`);
        });

        rl.question('> ', (answer: string) => {
            rl.close();
            const index = parseInt(answer, 10) - 1;
            if (options[index]) {
                resolve(options[index].value);
            } else {
                resolve('last-used');
            }
        });
    });
}

async function main() {
    try {
        // Check if config exists and has blog directory
        const configData = config.read();
        if (!configData || !configData.blogDir) {
            console.log('⚠️  Blog configuration not found or incomplete.');
            await runSetupGuide();
            return;
        }

        let lastUsed = configData.lastUsed;
        let selection = await selectOption();

        if (selection === 'last-used') {
            selection = lastUsed || 'gemini';
        }

        config.write({ ...configData, lastUsed: selection });

        const blogDir = getBlogDir();

        switch (selection) {
            case 'gemini':
                console.log('Opening Gemini CLI...');
                console.log(`Blog directory: ${blogDir}`);
                // We can't open a new terminal from here, so we'll just print a message
                break;
            case 'cursor':
                console.log(`Opening Cursor with blog directory: ${blogDir}`);
                child_process.exec(`cursor "${blogDir}"`);
                break;
            case 'obsidian':
                console.log(`Opening Obsidian with blog directory: ${blogDir}`);
                child_process.exec(`obsidian "${blogDir}"`);
                break;
        }
    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

main();
