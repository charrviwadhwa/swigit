import { simpleGit } from 'simple-git';
import chalk from 'chalk';

const git = simpleGit();

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

export async function runAudit() {
  console.log(chalk.yellow('🔍 [CleanPR] Auditing your changes...'));

  // Get the diff of staged files
  const diff = await git.diff(['--cached']);
  
  if (!diff) {
    console.log(chalk.gray('No staged changes found to audit.'));
    return true; 
  }

  let issuesFound = 0;

  RULES.forEach(rule => {
    const matches = diff.match(rule.regex);
    if (matches) {
      console.log(chalk.red(`❌ ${rule.name}: ${rule.msg}`));
      console.log(chalk.dim(`   Found: ${matches.join(', ')}`));
      issuesFound++;
    }
  });

  if (issuesFound > 0) {
    console.log(chalk.red(`\n🛡️  CleanPR blocked the push. Fix these ${issuesFound} issues first!`));
    return false;
  }

  console.log(chalk.green('✅ CleanPR: Code looks safe and clean.'));
  return true;
}