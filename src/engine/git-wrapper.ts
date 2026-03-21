import { simpleGit } from 'simple-git';
import chalk from 'chalk';

const git = simpleGit();

export async function shipIt(message: string) {
  try {
    console.log(chalk.blue('📦 [DevGit] Staging all files...'));
    await git.add('.');

    console.log(chalk.blue(`💾 [DevGit] Committing: "${message}"`));
    await git.commit(message);

    const status = await git.status();
    const branch = status.current || 'main';

    console.log(chalk.blue(`🛰️  [DevGit] Pushing to origin/${branch}...`));
    await git.push('origin', branch);

    console.log(chalk.green.bold('\n🚀 Mission Accomplished: Code is clean and pushed!'));
  } catch (error: any) {
    console.error(chalk.red(`\n❌ DevGit Error: ${error.message}`));
    process.exit(1);
  }
}