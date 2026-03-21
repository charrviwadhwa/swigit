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
exports.superInit = superInit;
exports.syncRepo = syncRepo;
exports.createBranch = createBranch;
exports.smartSwitch = smartSwitch;
exports.undoLastCommit = undoLastCommit;
exports.wipeChanges = wipeChanges;
exports.repoInfo = repoInfo;
exports.oneCommandShip = oneCommandShip;
exports.mergeAndPush = mergeAndPush;
exports.smartClone = smartClone;
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Helper to run commands cleanly
const run = (cmd) => (0, child_process_1.execSync)(cmd, { stdio: 'inherit' });
const runSilent = (cmd) => (0, child_process_1.execSync)(cmd).toString().trim();
async function superInit(url) {
    console.log(chalk_1.default.blue('🚀 Initializing new DevGit workflow...'));
    try {
        run('git init');
        run('git add .');
        run('git commit -m "Initial commit"');
        run('git branch -M main');
        run(`git remote add origin ${url}`);
        run('git push -u origin main');
        console.log(chalk_1.default.green('✅ Repo initialized and linked!'));
    }
    catch (e) {
        console.error(chalk_1.default.red('❌ Failed to init.'));
    }
}
async function syncRepo() {
    console.log(chalk_1.default.blue('🔄 Syncing with remote...'));
    try {
        run('git fetch --all');
        run('git pull --rebase');
        run('git status');
        console.log(chalk_1.default.green('✅ Repo is up to date!'));
    }
    catch (e) {
        console.error(chalk_1.default.red('❌ Conflict detected during sync.'));
    }
}
async function createBranch(name) {
    try {
        run(`git checkout -b ${name}`);
        run(`git push -u origin ${name}`);
        console.log(chalk_1.default.green(`✅ Switched to and pushed new branch: ${name}`));
    }
    catch (e) {
        console.error(chalk_1.default.red('❌ Failed to create branch.'));
    }
}
async function smartSwitch(name) {
    console.log(chalk_1.default.yellow('📦 Stashing current work...'));
    try {
        run('git stash');
        run(`git checkout ${name}`);
        console.log(chalk_1.default.blue('📥 Popping stash...'));
        try {
            run('git stash pop');
        }
        catch (e) { /* Ignore if stash is empty */ }
        console.log(chalk_1.default.green(`✅ Safely switched to ${name}`));
    }
    catch (e) {
        console.error(chalk_1.default.red('❌ Failed to switch branches.'));
    }
}
async function undoLastCommit() {
    try {
        run('git reset --soft HEAD~1');
        console.log(chalk_1.default.green('⏪ Undid last commit. Your code is still here, just staged!'));
    }
    catch (e) {
        console.error(chalk_1.default.red('❌ Failed to undo.'));
    }
}
async function wipeChanges() {
    console.log(chalk_1.default.red('🔥 Wiping uncommitted changes...'));
    try {
        run('git reset --hard');
        run('git clean -fd');
        console.log(chalk_1.default.green('✅ Working directory is clean.'));
    }
    catch (e) {
        console.error(chalk_1.default.red('❌ Failed to wipe.'));
    }
}
async function repoInfo() {
    console.log(chalk_1.default.cyan.bold('\n📊 DevGit Repo Dashboard:'));
    try {
        console.log(chalk_1.default.yellow('\nRemotes:'));
        run('git remote -v');
        console.log(chalk_1.default.yellow('\nCurrent Branch:'));
        run('git branch --show-current');
        console.log(chalk_1.default.yellow('\nLast Commit:'));
        run('git log -1 --oneline');
    }
    catch (e) {
        console.error(chalk_1.default.red('❌ Could not fetch repo info.'));
    }
}
async function oneCommandShip(message) {
    try {
        run('git add .');
        run(`git commit -m "${message}"`);
        const branch = runSilent('git branch --show-current');
        run(`git push origin ${branch}`);
        console.log(chalk_1.default.green(`\n🚀 Shipped "${message}" to ${branch}!`));
    }
    catch (e) {
        console.error(chalk_1.default.red('\n❌ Shipping failed. Check git status.'));
    }
}
async function mergeAndPush(targetBranch) {
    console.log(chalk_1.default.blue(`🔀 Merging '${targetBranch}' into current branch...`));
    try {
        const currentBranch = runSilent('git branch --show-current');
        if (currentBranch === targetBranch) {
            console.log(chalk_1.default.red(`❌ You cannot merge a branch into itself.`));
            return;
        }
        // 1. Merge the code
        run(`git merge ${targetBranch}`);
        // 2. Push the updated current branch to GitHub
        console.log(chalk_1.default.blue(`🛰️ Pushing updated '${currentBranch}' to remote...`));
        run(`git push origin ${currentBranch}`);
        // 3. The "Smart" Part: Clean up the old branch locally
        console.log(chalk_1.default.yellow(`🧹 Cleaning up: Deleting local branch '${targetBranch}'...`));
        run(`git branch -d ${targetBranch}`);
        console.log(chalk_1.default.green.bold(`\n✅ Successfully merged, pushed, and cleaned up!`));
    }
    catch (e) {
        console.error(chalk_1.default.red('\n❌ Merge failed. You might have merge conflicts to resolve first.'));
    }
}
async function smartClone(url) {
    console.log(chalk_1.default.blue(`🚀 Cloning repository from ${url}...`));
    try {
        // 1. Run standard clone
        run(`git clone ${url}`);
        // 2. Extract the folder name from the URL (e.g., https://github.com/user/repo.git -> repo)
        const repoName = url.split('/').pop()?.replace('.git', '');
        if (!repoName)
            throw new Error("Could not parse repository name.");
        // 3. Move the Node process into the new directory
        process.chdir(repoName);
        console.log(chalk_1.default.cyan(`📂 Moved into ./${repoName}`));
        // 4. The "Smart" Part: Auto-detect environment
        if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
            console.log(chalk_1.default.yellow('📦 Node.js project detected. Installing dependencies...'));
            // Bonus: Detect the right package manager based on lockfiles
            if (fs.existsSync('pnpm-lock.yaml')) {
                run('pnpm install');
            }
            else if (fs.existsSync('yarn.lock')) {
                run('yarn install');
            }
            else {
                run('npm install');
            }
            console.log(chalk_1.default.green('✅ Dependencies installed!'));
        }
        console.log(chalk_1.default.green.bold('\n🎉 Smart Clone complete! You are ready to code.'));
    }
    catch (e) {
        console.error(chalk_1.default.red(`❌ Failed to smart clone: ${e.message}`));
    }
}
