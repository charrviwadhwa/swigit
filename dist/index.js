#!/usr/bin/env node
import { execSync } from 'child_process';
import { Command } from 'commander';
import chalk from 'chalk';
// 🛑 Change these:
import { runAudit } from './audit/scanner.js';
import { generateCommitMessage } from './utils/ai.js';
import { runSetup } from './engine/setup.js';
import * as git from './engine/git-wrapper.js';
const program = new Command();
program
    .name('swigit')
    .description('The all-in-one Smart Git CLI with CleanPR protection')
    .version('1.0.0');
// ==========================================
// 1. PROJECT LIFECYCLES
// ==========================================
program
    .command('init <url>')
    .description('Initialize repo, commit, and link to remote')
    .action(async (url) => {
    await git.superInit(url);
});
program
    .command('sync')
    .description('Fetch and pull with rebase to prevent merge commits')
    .action(async () => {
    await git.syncRepo();
});
program
    .command('clone <url>')
    .description('Clone a repo and auto-install dependencies')
    .action(async (url) => {
    await git.smartClone(url);
});
// ==========================================
// 2. QUALITY CONTROL (CleanPR)
// ==========================================
program
    .command('audit')
    .description('Run CleanPR scan on staged files without pushing')
    .action(async () => {
    await runAudit();
});
// ==========================================
// 3. BRANCHING & CONTEXT SWITCHING
// ==========================================
program
    .command('branch <name>')
    .description('Create a new branch and push it to remote')
    .action(async (name) => {
    await git.createBranch(name);
});
program
    .command('switch <name>')
    .description('Auto-stash changes and switch branches')
    .action(async (name) => {
    await git.smartSwitch(name);
});
program
    .command('merge <name>')
    .description('Merge a branch into current and push')
    .action(async (name) => {
    await git.mergeAndPush(name);
});
// ==========================================
// 4. UTILITY & CLEANUP
// ==========================================
program
    .command('undo')
    .description('Undo the last commit but keep the code changes')
    .action(async () => {
    await git.undoLastCommit();
});
program
    .command('wipe')
    .description('Panic button: delete all uncommitted changes')
    .action(async () => {
    await git.wipeChanges();
});
program
    .command('info')
    .description('View repo dashboard (remote, branch, last commit)')
    .action(async () => {
    await git.repoInfo();
});
program
    .command('setup')
    .description('Configure Gemini AI keys for DevGit')
    .action(async () => {
    await runSetup();
});
// ==========================================
// 5. THE DAILY "SHIPPING" WORKFLOW (Default)
// ==========================================
program
    .argument('[message]', 'Commit message')
    .option('-f, --force', 'Bypass CleanPR security audit')
    .action(async (message, options) => {
    // 1. Stage files SILENTLY (Hides the LF/CRLF warnings)
    console.log(chalk.blue('📦 Staging files for analysis...'));
    try {
        execSync('git add .', { stdio: 'ignore' }); // 'ignore' hides the warnings
    }
    catch (e) {
        // If git add fails (e.g. not a git repo), catch it here
        console.log(chalk.red("❌ Error: Not a git repository."));
        return;
    }
    // 2. CHECK: Is the working tree actually clean?
    const status = execSync('git status --short').toString().trim();
    if (!status) {
        console.log(chalk.green('✨ Everything is already up to date. Nothing to ship!'));
        return; // This stops the code BEFORE it tries to commit anything
    }
    let finalMessage = message;
    // 3. AI Generation
    if (!finalMessage) {
        console.log(chalk.magenta('🧠 Consulting Gemini for the perfect message...'));
        finalMessage = await generateCommitMessage();
        console.log(chalk.cyan(`🤖 AI Suggestion: "${finalMessage}"`));
    }
    // 4. CleanPR Audit
    if (!options.force) {
        const isClean = await runAudit();
        if (!isClean) {
            console.log(chalk.red("❌ Audit failed. Check your files for secrets."));
            process.exit(1);
        }
    }
    // 5. Shipping
    try {
        await git.oneCommandShip(finalMessage);
        process.exit(0);
    }
    catch (error) {
        console.log(chalk.red('\n❌ An unexpected error occurred.'));
        process.exit(1);
    }
});
program.parse(process.argv);
