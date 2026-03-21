"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAudit = runAudit;
const simple_git_1 = require("simple-git");
const chalk_1 = __importDefault(require("chalk"));
const git = (0, simple_git_1.simpleGit)();
// 🛡️ THE IGNORE LIST: Don't scan DevGit's own config files for the word ".env"
const IGNORE_LIST = [
    'audit/scanner',
    'engine/setup',
    'index',
    'README.md',
    'package.json'
];
// 🚨 THE RULES ENGINE: Exclusively focused on Security & Secrets
const RULES = [
    { name: 'Hardcoded Secret', regex: /api_key\s*=|password\s*=|secret\s*=/gi, msg: 'Potential plain-text secret detected!' },
    { name: 'Environment File Leak', regex: /\.env/g, msg: 'Reference to .env found. Do not commit secrets!' },
    { name: 'Private Key Leak', regex: /BEGIN PRIVATE KEY/g, msg: 'Private SSH/SSL key detected!' }
];
async function runAudit() {
    console.log(chalk_1.default.blue('🔍 [CleanPR] Scanning for security risks...'));
    const stagedFilesRaw = await git.diff(['--cached', '--name-only']);
    const stagedFiles = stagedFilesRaw.split('\n').filter(Boolean);
    if (stagedFiles.length === 0)
        return true;
    let issuesFound = 0;
    for (const file of stagedFiles) {
        // Skip files that intentionally contain security keywords (like our setup script)
        const isIgnored = IGNORE_LIST.some(ignoredFile => file.includes(ignoredFile));
        if (isIgnored)
            continue;
        const fileDiff = await git.diff(['--cached', file]);
        // Only scan the NEW lines of code being added
        const addedLines = fileDiff.split('\n')
            .filter(line => line.startsWith('+') && !line.startsWith('+++'))
            .join('\n');
        if (!addedLines)
            continue;
        // Test the code against our security rules
        RULES.forEach(rule => {
            if (rule.regex.test(addedLines)) {
                console.log(chalk_1.default.red(`❌ ${rule.name} in ${chalk_1.default.yellow(file)}: ${rule.msg}`));
                issuesFound++;
            }
        });
    }
    if (issuesFound > 0) {
        console.log(chalk_1.default.red(`\n🛡️  CleanPR blocked the push to protect your secrets. Fix these ${issuesFound} issues first!`));
        return false;
    }
    console.log(chalk_1.default.green('✅ CleanPR: No secrets detected. Code is safe to ship.'));
    return true;
}
