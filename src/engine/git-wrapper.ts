import { execSync } from 'child_process';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

// Helper to run commands cleanly
const run = (cmd: string) => execSync(cmd, { stdio: 'inherit' });
const runSilent = (cmd: string) => execSync(cmd).toString().trim();

export async function superInit(url: string) {
    console.log(chalk.blue('🚀 Initializing new DevGit workflow...'));
    try {
        run('git init');
        run('git add .');
        run('git commit -m "Initial commit"');
        run('git branch -M main');
        run(`git remote add origin ${url}`);
        run('git push -u origin main');
        console.log(chalk.green('✅ Repo initialized and linked!'));
    } catch (e) { console.error(chalk.red('❌ Failed to init.')); }
}


export async function syncRepo() {
    console.log(chalk.blue('🔄 Preparing to sync (Autostashing local changes)...'));
    try {
        // 1. Temporarily hide your changes
        execSync('git stash', { stdio: 'inherit' });

        // 2. Pull the latest from GitHub
        console.log(chalk.blue('📥 Pulling latest changes from remote...'));
        execSync('git pull --rebase origin main', { stdio: 'inherit' });

        // 3. Bring your changes back
        console.log(chalk.blue('📤 Restoring your local changes...'));
        execSync('git stash pop', { stdio: 'inherit' });

        console.log(chalk.green('✅ Sync complete! You are now up to date.'));
    } catch (error) {
        console.log(chalk.yellow('⚠️  Sync finished, but you may need to check your files (or stash was empty).'));
    }
}

export async function oneCommandShip(message: string) {
    try {
        // We don't need 'git add' here because the scanner already did it!
        execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
        execSync('git push origin main', { stdio: 'inherit' });
        console.log(chalk.green(`\n🚀 Shipped "${message}" to main!`));
    } catch (error) {
        console.log(chalk.red('\n❌ Shipping failed. Check git status.'));
    }
}

export async function createBranch(name: string) {
    try {
        run(`git checkout -b ${name}`);
        run(`git push -u origin ${name}`);
        console.log(chalk.green(`✅ Switched to and pushed new branch: ${name}`));
    } catch (e) { console.error(chalk.red('❌ Failed to create branch.')); }
}

export async function smartSwitch(name: string) {
    console.log(chalk.yellow('📦 Stashing current work...'));
    try {
        run('git stash');
        run(`git checkout ${name}`);
        console.log(chalk.blue('📥 Popping stash...'));
        try { run('git stash pop'); } catch(e) { /* Ignore if stash is empty */ }
        console.log(chalk.green(`✅ Safely switched to ${name}`));
    } catch (e) { console.error(chalk.red('❌ Failed to switch branches.')); }
}

export async function undoLastCommit() {
    try {
        run('git reset --soft HEAD~1');
        console.log(chalk.green('⏪ Undid last commit. Your code is still here, just staged!'));
    } catch (e) { console.error(chalk.red('❌ Failed to undo.')); }
}

export async function wipeChanges() {
    console.log(chalk.red('🔥 Wiping uncommitted changes...'));
    try {
        run('git reset --hard');
        run('git clean -fd');
        console.log(chalk.green('✅ Working directory is clean.'));
    } catch (e) { console.error(chalk.red('❌ Failed to wipe.')); }
}

export async function repoInfo() {
    console.log(chalk.cyan.bold('\n📊 DevGit Repo Dashboard:'));
    try {
        console.log(chalk.yellow('\nRemotes:'));
        run('git remote -v');
        console.log(chalk.yellow('\nCurrent Branch:'));
        run('git branch --show-current');
        console.log(chalk.yellow('\nLast Commit:'));
        run('git log -1 --oneline');
    } catch (e) { console.error(chalk.red('❌ Could not fetch repo info.')); }
}



export async function mergeAndPush(targetBranch: string) {
    console.log(chalk.blue(`🔀 Merging '${targetBranch}' into current branch...`));
    
    try {
        const currentBranch = runSilent('git branch --show-current');

        if (currentBranch === targetBranch) {
            console.log(chalk.red(`❌ You cannot merge a branch into itself.`));
            return;
        }

        // 1. Merge the code
        run(`git merge ${targetBranch}`);

        // 2. Push the updated current branch to GitHub
        console.log(chalk.blue(`🛰️ Pushing updated '${currentBranch}' to remote...`));
        run(`git push origin ${currentBranch}`);

        // 3. The "Smart" Part: Clean up the old branch locally
        console.log(chalk.yellow(`🧹 Cleaning up: Deleting local branch '${targetBranch}'...`));
        run(`git branch -d ${targetBranch}`);

        console.log(chalk.green.bold(`\n✅ Successfully merged, pushed, and cleaned up!`));
    } catch (e: any) { 
        console.error(chalk.red('\n❌ Merge failed. You might have merge conflicts to resolve first.')); 
    }
}

export async function smartClone(url: string) {
    console.log(chalk.blue(`🚀 Cloning repository from ${url}...`));
    
    try {
        // 1. Run standard clone
        run(`git clone ${url}`);

        // 2. Extract the folder name from the URL (e.g., https://github.com/user/repo.git -> repo)
        const repoName = url.split('/').pop()?.replace('.git', '');
        
        if (!repoName) throw new Error("Could not parse repository name.");

        // 3. Move the Node process into the new directory
        process.chdir(repoName);
        console.log(chalk.cyan(`📂 Moved into ./${repoName}`));

        // 4. The "Smart" Part: Auto-detect environment
        if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
            console.log(chalk.yellow('📦 Node.js project detected. Installing dependencies...'));
            
            // Bonus: Detect the right package manager based on lockfiles
            if (fs.existsSync('pnpm-lock.yaml')) {
                run('pnpm install');
            } else if (fs.existsSync('yarn.lock')) {
                run('yarn install');
            } else {
                run('npm install');
            }
            console.log(chalk.green('✅ Dependencies installed!'));
        }

        console.log(chalk.green.bold('\n🎉 Smart Clone complete! You are ready to code.'));
    } catch (e: any) { 
        console.error(chalk.red(`❌ Failed to smart clone: ${e.message}`)); 
    }
}
export async function ensureStaged() {
    const status = runSilent('git status --short');
    
    // If there is literally nothing changed (staged or unstaged)
    if (!status) {
        return false;
    }

    const staged = runSilent('git diff --cached --name-only');
    
    // If there are changes, but none are staged
    if (!staged) {
        console.log(chalk.yellow('📦 No staged changes found. Auto-staging all files...'));
        run('git add .');
    }
    
    return true;
}