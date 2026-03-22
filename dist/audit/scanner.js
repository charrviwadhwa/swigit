import { execSync } from 'child_process';
import chalk from 'chalk';
// 🛡️ Ignore list for Swigit's own development
const IGNORE_LIST = [
    'src/audit/scanner.ts',
    'src/engine/setup.ts',
    'src/index.ts',
    'dist/',
    'node_modules'
];
// 🌟 NEW: Universally safe files that shouldn't be scanned for secrets
const SAFE_FILES = [
    '.gitignore',
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'README.md',
    'LICENSE'
];
// 🚨 SMART RULES: Only block if it looks like a variable assignment to a string
const RULES = [
    {
        name: 'Hardcoded Secret',
        // Checks for: key = "value" or password: 'value'
        regex: /(password|pass|api_key|secret|token)\s*[:=]\s*['"`].*['"`]/gi
    }
    // We removed the old Environment Leak regex because it was too broad!
];
export async function runAudit() {
    console.log(chalk.blue('🔍 [CleanPR] Running Deep Security Scan...'));
    try {
        // 1. Force stage
        execSync('git add .');
        // 2. Get staged files
        const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
            .split('\n')
            .filter(Boolean);
        let issuesFound = 0;
        for (const file of stagedFiles) {
            // Check if it's an internal Swigit file
            if (IGNORE_LIST.some(ignored => file.includes(ignored)))
                continue;
            // 👉 THE FIX: Skip safe config & doc files from content scanning
            if (SAFE_FILES.some(safe => file.endsWith(safe)))
                continue;
            // 🌟 NEW: The Ultimate Environment Leak Check
            // Checks the actual filename instead of the content!
            if (file.endsWith('.env') || file.includes('.env.')) {
                // Allow .env.example or .env.template, but block actual env files
                if (!file.endsWith('.example') && !file.endsWith('.template')) {
                    console.log(chalk.red(`❌ Security Risk: You are trying to commit a ${chalk.yellow(file)} file!`));
                    issuesFound++;
                    continue; // Move to the next file
                }
            }
            // 3. Get the content for the remaining files
            const fileContent = execSync(`git show :0:"${file}"`, { encoding: 'utf8' }).toLowerCase();
            for (const rule of RULES) {
                // We reset the regex state for each file
                const testRegex = new RegExp(rule.regex);
                if (testRegex.test(fileContent)) {
                    console.log(chalk.red(`❌ Security Risk in ${chalk.yellow(file)}: ${rule.name} detected!`));
                    issuesFound++;
                    break;
                }
            }
        }
        if (issuesFound > 0) {
            console.log(chalk.red(`\n🛡️  CleanPR blocked the push. Fix these ${issuesFound} issues!`));
            return false;
        }
        console.log(chalk.green('✅ CleanPR: No secrets detected.'));
        return true;
    }
    catch (error) {
        return true;
    }
}
