import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import readline from 'readline';
import chalk from 'chalk';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export async function runSetup() {
  console.log(chalk.magenta.bold('\n🛠️  DevGit AI Setup'));
  
  // 1. Ask for the Provider Preference
  rl.question('Which AI provider do you want to use? (gemini / openai): ', (providerInput) => {
    const provider = providerInput.trim().toLowerCase();
    
    if (provider !== 'gemini' && provider !== 'openai') {
      console.log(chalk.red('❌ Unsupported provider. Please choose "gemini" or "openai".'));
      rl.close();
      return;
    }

    // 2. Ask for the specific key for that provider
    rl.question(`🔑 Enter your ${provider.toUpperCase()} API Key: `, (apiKey) => {
      if (!apiKey) {
        console.log(chalk.red('❌ API Key is required.'));
        rl.close();
        return;
      }

      // 3. Define the Global "Safe" path (e.g., C:\Users\Charvi\.devgit\.env)
      const configDir = path.join(os.homedir(), '.devgit');
      const envPath = path.join(configDir, '.env');

      try {
        // Create the hidden folder if it doesn't exist yet
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir);
        }

        // Save BOTH the provider preference and the key
        const envContent = `AI_PROVIDER=${provider}\n${provider.toUpperCase()}_API_KEY=${apiKey}\n`;
        fs.writeFileSync(envPath, envContent);
        
        console.log(chalk.green(`\n✅ Setup complete! DevGit is now powered by ${provider.toUpperCase()}.`));
        console.log(chalk.gray(`🔒 Config saved securely at: ${envPath}`));
      } catch (error) {
        console.error(chalk.red('❌ Failed to save setup configuration.'));
      }

      rl.close();
    });
  });
}