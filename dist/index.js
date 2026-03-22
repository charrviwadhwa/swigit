#!/usr/bin/env node
import { execSync } from 'child_process';
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import os from 'os';
import path from 'path';
// Internal Imports
import { runAudit } from './audit/scanner.js';
import { generateCommitMessage } from './utils/ai.js';
import { runSetup } from './engine/setup.js';
import * as git from './engine/git-wrapper.js';
const CONFIG_DIR = path.join(os.homedir(), '.swigit');
const CONFIG_PATH = path.join(CONFIG_DIR, '.env');
const program = new Command();
async function main() {
    // 1. BOOTSTRAP: Check if setup is needed before anything else
    // We check the directory and the file
    if (!fs.existsSync(CONFIG_PATH)) {
        console.log(chalk.cyan('👋 Welcome to Swigit! Let\'s get you set up first.'));
        await runSetup();
        // After setup, we don't exit; we allow the command to continue
    }
    // 2. CLI CONFIGURATION
    program
        .name('swigit')
        .description('The all-in-one Smart Git CLI with CleanPR protection')
        .version('1.0.5');
    // --- Commands ---
    program
        .command('init <url>')
        .description('Initialize repo, commit, and link to remote')
        .action(async (url) => await git.superInit(url));
    program
        .command('sync')
        .description('Fetch and pull with rebase to prevent merge commits')
        .action(async () => await git.syncRepo());
    program
        .command('clone <url>')
        .description('Clone a repo and auto-install dependencies')
        .action(async (url) => await git.smartClone(url));
    program
        .command('audit')
        .description('Run CleanPR scan on staged files without pushing')
        .action(async () => {
        await runAudit();
    });
    program
        .command('branch <name>')
        .description('Create a new branch and push it to remote')
        .action(async (name) => await git.createBranch(name));
    program
        .command('switch <name>')
        .description('Auto-stash changes and switch branches')
        .action(async (name) => await git.smartSwitch(name));
    program
        .command('undo')
        .description('Undo the last commit but keep the code changes')
        .action(async () => await git.undoLastCommit());
    program
        .command('wipe')
        .description('Panic button: delete all uncommitted changes')
        .action(async () => await git.wipeChanges());
    program
        .command('info')
        .description('View repo dashboard')
        .action(async () => await git.repoInfo());
    program
        .command('setup')
        .description('Reconfigure Gemini AI keys')
        .action(async () => await runSetup());
    // --- DEFAULT ACTION (The "Shipping" Workflow) ---
    program
        .argument('[message]', 'Commit message')
        .option('-f, --force', 'Bypass CleanPR security audit')
        .action(async (message, options) => {
        console.log(chalk.blue('📦 Staging files for analysis...'));
        try {
            execSync('git add .', { stdio: 'ignore' });
        }
        catch (e) {
            console.log(chalk.red("❌ Error: Not a git repository."));
            return;
        }
        const status = execSync('git status --short').toString().trim();
        if (!status) {
            console.log(chalk.green('✨ Everything is already up to date. Nothing to ship!'));
            return;
        }
        let finalMessage = message;
        if (!finalMessage) {
            console.log(chalk.magenta('🧠 Consulting Gemini for the perfect message...'));
            finalMessage = await generateCommitMessage();
            console.log(chalk.cyan(`🤖 AI Suggestion: "${finalMessage}"`));
        }
        if (!options.force) {
            const isClean = await runAudit();
            if (!isClean) {
                process.exit(1);
            }
        }
        try {
            await git.oneCommandShip(finalMessage);
            process.exit(0);
        }
        catch (error) {
            console.log(chalk.red('\n❌ An unexpected error occurred.'));
            process.exit(1);
        }
    });
    // 3. EXECUTION: Parse the arguments
    await program.parseAsync(process.argv);
}
// EXECUTE THE WRAPPER
main().catch((err) => {
    console.error(chalk.red('💥 Fatal Error:'), err);
    process.exit(1);
});
