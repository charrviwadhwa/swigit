import * as fs from 'fs';
import * as path from 'path';
import readline from 'readline';
import chalk from 'chalk';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export async function runSetup() {
  console.log(chalk.magenta.bold('\n🛠️  DevGit Setup: Let\'s get you connected to Gemini AI.'));
  
  rl.question('🔑 Enter your Gemini API Key: ', (apiKey) => {
    if (!apiKey) {
      console.log(chalk.red('❌ API Key is required to use AI features.'));
      rl.close();
      return;
    }

    const envContent = `GEMINI_API_KEY=${apiKey}\n`;
    const envPath = path.join(process.cwd(), '.env');

    try {
      fs.writeFileSync(envPath, envContent);
      
      // Also ensure .env is in .gitignore so they don't leak it!
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        if (!gitignoreContent.includes('.env')) {
          fs.appendFileSync(gitignorePath, '\n.env\n');
        }
      } else {
        fs.writeFileSync(gitignorePath, '.env\n');
      }

      console.log(chalk.green('\n✅ Setup complete! Your API key is saved in .env and protected by .gitignore.'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to save setup configuration.'));
    }

    rl.close();
  });
}