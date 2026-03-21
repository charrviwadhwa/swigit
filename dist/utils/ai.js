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
const simple_git_1 = require("simple-git");
const chalk_1 = __importDefault(require("chalk"));
// Load the .env file if it exists
dotenv.config();
const git = (0, simple_git_1.simpleGit)();
async function generateCommitMessage() {
    // 1. We moved the check INSIDE the function!
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error(chalk_1.default.red("\n❌ Error: GEMINI_API_KEY not found."));
        console.log(chalk_1.default.yellow("👉 Please run 'devgit setup' to configure your API key.\n"));
        process.exit(1);
    }
    // 2. Initialize the AI only when we know we have the key
    const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    try {
        const diff = await git.diff(['--cached']);
        if (!diff) {
            console.log(chalk_1.default.red("❌ No staged changes found to analyze."));
            process.exit(1);
        }
        const prompt = `
      Analyze the following git diff and write a concise, professional commit message.
      Use the Conventional Commits format (e.g., feat:, fix:, chore:, docs:, refactor:).
      The message should be a single line under 60 characters.
      
      Diff:
      ${diff.substring(0, 5000)} 
    `;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim().replace(/`/g, "");
    }
    catch (error) {
        console.error(chalk_1.default.red("🤖 AI Error: Could not generate message."));
        return "update: structural changes";
    }
}
