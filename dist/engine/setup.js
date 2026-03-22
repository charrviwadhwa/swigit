import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline/promises';
import chalk from 'chalk';
const CONFIG_DIR = path.join(os.homedir(), '.swigit');
const CONFIG_FILE = path.join(CONFIG_DIR, '.env');
export async function runSetup() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    console.log(chalk.blue.bold('\n🛠️  Swigit AI Configuration'));
    // 1. Get the API Key (Hide input for security)
    // Note: Standard readline doesn't hide input easily, 
    // but we can simulate it or use a library like 'inquirer' later.
    const apiKey = await rl.question(chalk.yellow('🔑 Enter your GEMINI API Key: '));
    if (!apiKey) {
        console.log(chalk.red('❌ Error: API Key is required.'));
        process.exit(1);
    }
    try {
        // 2. Ensure Global Config Directory Exists
        if (!fs.existsSync(CONFIG_DIR)) {
            fs.mkdirSync(CONFIG_DIR);
        }
        // 3. Save the Global Config
        const configContent = `GEMINI_API_KEY=${apiKey}\n`;
        fs.writeFileSync(CONFIG_FILE, configContent);
        console.log(chalk.green(`\n✅ Global config saved at: ${chalk.white(CONFIG_FILE)}`));
        // 4. Project-Level Security: Auto-Gitignore
        const gitignorePath = path.join(process.cwd(), '.gitignore');
        const envEntry = '.env';
        if (!fs.existsSync(gitignorePath)) {
            // Create .gitignore if it doesn't exist
            fs.writeFileSync(gitignorePath, `${envEntry}\n`);
            console.log(chalk.cyan('🛡️  Created .gitignore and added .env to it.'));
        }
        else {
            // Check if .env is already ignored
            const content = fs.readFileSync(gitignorePath, 'utf8');
            if (!content.includes(envEntry)) {
                fs.appendFileSync(gitignorePath, `\n${envEntry}\n`);
                console.log(chalk.cyan('🛡️  Added .env to your existing .gitignore.'));
            }
        }
        console.log(chalk.green.bold('🚀 Swigit is now ready to ship!'));
    }
    catch (error) {
        console.log(chalk.red('❌ Failed to save configuration.'));
    }
    finally {
        rl.close();
    }
}
