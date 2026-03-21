import { Command } from 'commander';
import chalk from 'chalk';
import { runAudit } from './audit/scanner';
import { shipIt } from './engine/git-wrapper';
// We will import our logic here next

const program = new Command();

program
  .name('devgit')
  .description('The all-in-one Smart Git CLI with CleanPR protection')
  .version('1.0.0');

// The "Smart Ship" Command
program
  .argument('<message>', 'Commit message')
  .action(async (message) => {
    console.log(chalk.blue(`🚀 DevGit: Starting the "Ship" workflow...`));
    // 1. Run CleanPR Audit
    // 2. If Clean, Run DevGit Push

// ... inside the .action() block of your commander program:
    // 1. Audit first
    const isClean = await runAudit();
    
    // 2. Only ship if clean
    if (isClean) {
        await shipIt(message);
    } else {
        process.exit(1);
    }
});


program.parse(process.argv);