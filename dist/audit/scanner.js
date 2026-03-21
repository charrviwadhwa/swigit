"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAudit = runAudit;
const simple_git_1 = require("simple-git");
const chalk_1 = __importDefault(require("chalk"));
const git = (0, simple_git_1.simpleGit)();
// The "Smell" Dictionary
const RULES = [
    {
        name: 'Console Log',
        regex: /console\.log\(.*\)/g,
        msg: 'Leftover debug log found.'
    },
    {
        name: 'Hardcoded Secret',
        regex: /(api_key|secret|password|token|auth)\s*=\s*['"][a-zA-Z0-9]{16,}['"]/gi,
        msg: 'Potential plain-text secret detected!'
    },
    {
        name: 'Sensitive File',
        regex: /\.env|id_rsa|\.pem/gi,
        msg: 'Sensitive file detected in staging.'
    }
];
async function runAudit() {
    console.log(chalk_1.default.yellow('🔍 [CleanPR] Auditing your changes...'));
    // Get the diff of staged files
    const diff = await git.diff(['--cached']);
    if (!diff) {
        console.log(chalk_1.default.gray('No staged changes found to audit.'));
        return true;
    }
    let issuesFound = 0;
    RULES.forEach(rule => {
        const matches = diff.match(rule.regex);
        if (matches) {
            console.log(chalk_1.default.red(`❌ ${rule.name}: ${rule.msg}`));
            console.log(chalk_1.default.dim(`   Found: ${matches.join(', ')}`));
            issuesFound++;
        }
    });
    if (issuesFound > 0) {
        console.log(chalk_1.default.red(`\n🛡️  CleanPR blocked the push. Fix these ${issuesFound} issues first!`));
        return false;
    }
    console.log(chalk_1.default.green('✅ CleanPR: Code looks safe and clean.'));
    return true;
}
