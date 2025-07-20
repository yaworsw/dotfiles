
import { BlogConfig } from './blogConfig';
import * as child_process from 'child_process';
import * as readline from 'readline';

const config = new BlogConfig();

const options = [
    { name: 'Last Used', value: 'last-used' },
    { name: 'Gemini CLI', value: 'gemini' },
    { name: 'Cursor', value: 'cursor' },
    { name: 'Obsidian', value: 'obsidian' },
];

function getBlogDir(): string {
    // In the future, we can implement logic to find the blog directory
    // For now, we'll just use a placeholder
    return '~/blog';
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

        rl.question('> ', (answer) => {
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
    let lastUsed = config.read()?.lastUsed;
    let selection = await selectOption();

    if (selection === 'last-used') {
        selection = lastUsed || 'gemini';
    }

    config.write({ lastUsed: selection });

    const blogDir = getBlogDir();

    switch (selection) {
        case 'gemini':
            console.log('Opening Gemini CLI...');
            // We can't open a new terminal from here, so we'll just print a message
            break;
        case 'cursor':
            child_process.exec(`cursor ${blogDir}`);
            break;
        case 'obsidian':
            child_process.exec(`obsidian ${blogDir}`);
            break;
    }
}

main();
