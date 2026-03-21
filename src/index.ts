#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
// 🛑 Change these:
import { runAudit } from './audit/scanner.js';
import { generateCommitMessage } from './utils/ai.js';
import { runSetup } from './engine/setup.js';
import * as git from './engine/git-wrapper.js';

const program = new Command();

program
  .name('devgit')
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
  .argument('[message]', 'Commit message (AI will generate if left blank)')
  .option('-f, --force', 'Bypass CleanPR security audit')
  .action(async (message, options) => {
    
    // Ignore if a known command was passed as an argument by mistake
    if (['init', 'sync', 'clone', 'audit', 'branch', 'switch', 'merge', 'undo', 'wipe', 'info', 'setup'].includes(message)) {
        return;
    }

    // 👉 THE FIX: Stage the files immediately so AI and CleanPR can read them!
    const { execSync } = require('child_process');
    console.log(chalk.blue('📦 Staging files for analysis...'));
    execSync('git add .');

    let finalMessage = message;

    if (!finalMessage) {
      finalMessage = await generateCommitMessage();
      console.log(chalk.cyan(`🤖 AI Suggestion: "${finalMessage}"`));
    }

    if (!options.force) {
      const isClean = await runAudit();
      if (!isClean) {
        console.log(chalk.red("❌ Audit failed. Use --force to bypass if absolutely necessary."));
        process.exitCode =1;
        return;
      }
    }

    await git.oneCommandShip(finalMessage);
    console.log(chalk.green('✨ Mission Accomplished.'));

process.exit(0);
  });

program.parse(process.argv);