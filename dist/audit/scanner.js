import { execSync } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
// 🛡️ Internal files and common non-code files to skip
const IGNORE_LIST = ['src/audit/scanner.ts', 'dist/', 'node_modules', '.git/'];
const SAFE_FILES = ['.gitignore', 'package.json', 'package-lock.json', 'README.md', 'LICENSE'];
const RULES = [
    {
        name: 'Hardcoded Secret',
        // 🌟 Matches the pattern of the key ALONE (no variable name needed)
        // It now catches AKIA, sk_test, and ghp_ anywhere in the file.
        regex: /(AKIA|ASIA)[0-9A-Z]{16}|sk_(live|test)_[0-9a-zA-Z]{24}|ghp_[a-zA-Z0-9]{36}/i
    },
    {
        name: 'Assignment Secret',
        // 🌟 Matches: password = "...", key: '...', etc.
        regex: /(password|pass|api_key|secret|token|key)\s*[:=]\s*['"`].*['"`]/i
    }
];
export async function runAudit() {
    console.log(chalk.blue('🔍 [CleanPR] Running Deep Security Scan...'));
    try {
        // 1. Get staged files
        const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
            .split('\n')
            .filter(Boolean);
        // 🌟 DEBUG: See if Git actually sees your file
        console.log(chalk.gray(`Found ${stagedFiles.length} staged files: ${stagedFiles.join(', ')}`));
        if (stagedFiles.length === 0) {
            console.log(chalk.yellow('⚠️ No files are staged. Run "git add ." first!'));
            return true;
        }
        let issuesFound = 0;
        for (const file of stagedFiles) {
            if (IGNORE_LIST.some(ignored => file.includes(ignored)))
                continue;
            if (SAFE_FILES.some(safe => file.endsWith(safe)))
                continue;
            const absolutePath = path.resolve(process.cwd(), file);
            if (fs.existsSync(absolutePath)) {
                // 1. Read the raw buffer first
                const buffer = fs.readFileSync(absolutePath);
                // 2. Convert to string and STRIP the UTF-16 BOM and null bytes
                // Windows PowerShell 'echo' often adds null bytes between characters
                let fileContent = buffer.toString('utf8').replace(/\0/g, '');
                // 3. Remove the BOM (the  symbols)
                fileContent = fileContent.replace(/^\uFEFF/, '');
                // 🌟 DEBUG: This should now look like clean text
                // console.log("CLEAN CONTENT:", fileContent);
                for (const rule of RULES) {
                    const detector = new RegExp(rule.regex.source, 'gi');
                    if (detector.test(fileContent)) {
                        console.log(chalk.red(`❌ Security Risk in ${chalk.yellow(file)}: ${rule.name} detected!`));
                        issuesFound++;
                        break;
                    }
                }
            }
            else {
                console.log(chalk.yellow(`⚠️ File not found on disk: ${file}`));
            }
        }
        if (issuesFound > 0) {
            console.log(chalk.red(`\n🛡️  CleanPR blocked the push. Fix ${issuesFound} security issues!`));
            console.log(chalk.cyan('💡 Recommendation: ') + chalk.white('Move these secrets to a .env file.'));
            console.log(chalk.cyan('🚀 To bypass this once: ') + chalk.white.bold('swigit --force\n'));
            return false;
        }
        console.log(chalk.green('✅ CleanPR: No secrets detected.'));
        return true;
    }
    catch (error) {
        console.log(chalk.red('💥 Audit Error:'), error);
        return true;
    }
}
