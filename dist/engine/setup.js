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
exports.runSetup = runSetup;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const readline_1 = __importDefault(require("readline"));
const chalk_1 = __importDefault(require("chalk"));
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
async function runSetup() {
    console.log(chalk_1.default.magenta.bold('\n🛠️  DevGit Setup: Let\'s get you connected to Gemini AI.'));
    rl.question('🔑 Enter your Gemini API Key: ', (apiKey) => {
        if (!apiKey) {
            console.log(chalk_1.default.red('❌ API Key is required to use AI features.'));
            rl.close();
            return;
        }
        const envContent = `GEMINI_API_KEY=${apiKey}\n`;
        const envPath = path.join(process.cwd(), '.env');
        try {
            fs.writeFileSync(envPath, envContent);
            // Also ensure .env is in .gitignore so they don't leak it!
            const gitignorePath = path.join(process.cwd(), '.gitignore');
            if (fs.existsSync(gitignorePath)) {
                const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
                if (!gitignoreContent.includes('.env')) {
                    fs.appendFileSync(gitignorePath, '\n.env\n');
                }
            }
            else {
                fs.writeFileSync(gitignorePath, '.env\n');
            }
            console.log(chalk_1.default.green('\n✅ Setup complete! Your API key is saved in .env and protected by .gitignore.'));
        }
        catch (error) {
            console.error(chalk_1.default.red('❌ Failed to save setup configuration.'));
        }
        rl.close();
    });
}
