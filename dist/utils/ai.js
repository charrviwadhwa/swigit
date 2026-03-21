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
exports.generateCommitMessage = generateCommitMessage;
const generative_ai_1 = require("@google/generative-ai");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const simple_git_1 = require("simple-git");
const chalk_1 = __importDefault(require("chalk"));
// 1. Tell dotenv EXACTLY where the global safe is
const globalEnvPath = path.join(os.homedir(), '.devgit', '.env');
dotenv.config({ path: globalEnvPath });
const git = (0, simple_git_1.simpleGit)();
async function generateCommitMessage() {
    // 2. Read the preferred provider (defaults to gemini if not found)
    const provider = process.env.AI_PROVIDER || 'gemini';
    // 3. Grab the staged code changes
    const diff = await git.diff(['--cached']);
    if (!diff) {
        console.log(chalk_1.default.red("❌ No staged changes found to analyze."));
        process.exit(1);
    }
    const prompt = `Write a professional, concise, 1-line Conventional Commit message based on this git diff:\n${diff.substring(0, 3000)}`;
    try {
        console.log(chalk_1.default.gray(`🤖 Routing AI request to ${provider.toUpperCase()}...`));
        // ==========================================
        // ROUTE 1: GEMINI
        // ==========================================
        if (provider === 'gemini') {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey)
                throw new Error("GEMINI_API_KEY not found. Run 'devgit setup'");
            const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim().replace(/`/g, "");
        }
        // ==========================================
        // ROUTE 2: OPENAI
        // ==========================================
        else if (provider === 'openai') {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey)
                throw new Error("OPENAI_API_KEY not found. Run 'devgit setup'");
            // We use a dynamic require here so the app doesn't crash if a user 
            // only wants Gemini and hasn't installed the openai package.
            const { OpenAI } = require("openai");
            const openai = new OpenAI({ apiKey });
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
            });
            return response.choices[0].message.content.trim().replace(/`/g, "");
        }
        // Fallback if the user typed something weird in the .env file
        else {
            throw new Error(`Unsupported AI Provider: ${provider}`);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n🤖 AI Error: ${error.message}`));
        // Helpful hint if they chose OpenAI but forgot to install the package
        if (error.message.includes("Cannot find module 'openai'")) {
            console.log(chalk_1.default.yellow("👉 Hint: Run 'npm install openai' in your DevGit folder to enable the OpenAI integration."));
        }
        return "update: structural changes"; // Safe fallback so DevGit doesn't crash
    }
}
