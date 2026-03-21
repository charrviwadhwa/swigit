#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const scanner_1 = require("./audit/scanner");
const ai_1 = require("./utils/ai");
const setup_1 = require("./engine/setup");
const git = __importStar(require("./engine/git-wrapper")); // We will build this next!
const program = new commander_1.Command();
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
    await (0, scanner_1.runAudit)();
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
    await (0, setup_1.runSetup)();
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
    console.log(chalk_1.default.blue('📦 Staging files for analysis...'));
    execSync('git add .');
    let finalMessage = message;
    if (!finalMessage) {
        finalMessage = await (0, ai_1.generateCommitMessage)();
        console.log(chalk_1.default.cyan(`🤖 AI Suggestion: "${finalMessage}"`));
    }
    if (!options.force) {
        const isClean = await (0, scanner_1.runAudit)();
        if (!isClean) {
            console.log(chalk_1.default.red("❌ Audit failed. Use --force to bypass if absolutely necessary."));
            process.exitCode = 1;
            return;
        }
    }
    await git.oneCommandShip(finalMessage);
    console.log(chalk_1.default.green('✨ Mission Accomplished.'));
    // 🚀 Add this line to kill the process immediately after success
    process.exit(0);
});
program.parse(process.argv);
