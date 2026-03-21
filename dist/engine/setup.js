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
const os = __importStar(require("os"));
const readline_1 = __importDefault(require("readline"));
const chalk_1 = __importDefault(require("chalk"));
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
async function runSetup() {
    console.log(chalk_1.default.magenta.bold('\n🛠️  DevGit AI Setup'));
    // 1. Ask for the Provider Preference
    rl.question('Which AI provider do you want to use? (gemini / openai): ', (providerInput) => {
        const provider = providerInput.trim().toLowerCase();
        if (provider !== 'gemini' && provider !== 'openai') {
            console.log(chalk_1.default.red('❌ Unsupported provider. Please choose "gemini" or "openai".'));
            rl.close();
            return;
        }
        // 2. Ask for the specific key for that provider
        rl.question(`🔑 Enter your ${provider.toUpperCase()} API Key: `, (apiKey) => {
            if (!apiKey) {
                console.log(chalk_1.default.red('❌ API Key is required.'));
                rl.close();
                return;
            }
            // 3. Define the Global "Safe" path (e.g., C:\Users\Charvi\.devgit\.env)
            const configDir = path.join(os.homedir(), '.devgit');
            const envPath = path.join(configDir, '.env');
            try {
                // Create the hidden folder if it doesn't exist yet
                if (!fs.existsSync(configDir)) {
                    fs.mkdirSync(configDir);
                }
                // Save BOTH the provider preference and the key
                const envContent = `AI_PROVIDER=${provider}\n${provider.toUpperCase()}_API_KEY=${apiKey}\n`;
                fs.writeFileSync(envPath, envContent);
                console.log(chalk_1.default.green(`\n✅ Setup complete! DevGit is now powered by ${provider.toUpperCase()}.`));
                console.log(chalk_1.default.gray(`🔒 Config saved securely at: ${envPath}`));
            }
            catch (error) {
                console.error(chalk_1.default.red('❌ Failed to save setup configuration.'));
            }
            rl.close();
        });
    });
}
