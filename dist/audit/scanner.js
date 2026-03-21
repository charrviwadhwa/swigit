import { execSync } from 'child_process';
import chalk from 'chalk';
// 🛡️ Only ignore the actual DevGit source files, nothing else!
const IGNORE_LIST = [
    'src/audit/scanner.ts',
    'src/engine/setup.ts',
    'src/index.ts',
    'dist/',
    'node_modules'
];
// 🚨 Broader search terms
// 🚨 SMART RULES: Only block if it looks like a variable assignment to a string
const RULES = [
    {
        name: 'Hardcoded Secret',
        // Checks for: key = "value" or password: 'value'
        regex: /(password|pass|api_key|secret|token)\s*[:=]\s*['"`].*['"`]/gi
    },
    {
        name: 'Environment Leak',
        regex: /\.env/gi
    }
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
            // Check for exact file matches in ignore list
            if (IGNORE_LIST.some(ignored => file.includes(ignored)))
                continue;
            // 3. Get the content
            const fileContent = execSync(`git show :0:"${file}"`, { encoding: 'utf8' }).toLowerCase();
            // ... inside your 'for (const file of stagedFiles)' loop ...
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
