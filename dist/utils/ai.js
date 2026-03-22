import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as os from 'os';
import { simpleGit } from 'simple-git';
import chalk from 'chalk';
import { createRequire } from 'module';
// 1. Tell dotenv EXACTLY where the global Swigit vault is
// Changed from .devgit to .swigit
const globalEnvPath = path.join(os.homedir(), '.swigit', '.env');
dotenv.config({ path: globalEnvPath });
const git = simpleGit();
const require = createRequire(import.meta.url); // Necessary for dynamic OpenAI loading in ESM
export async function generateCommitMessage() {
    const provider = process.env.AI_PROVIDER || 'gemini';
    const diff = await git.diff(['--cached']);
    if (!diff) {
        console.log(chalk.red("❌ No staged changes found to analyze."));
        process.exit(1);
    }
    // Optimized prompt for better Conventional Commits
    const prompt = `Write a professional, concise, 1-line Conventional Commit message (e.g., feat: add login) based on this git diff:\n${diff.substring(0, 4000)}`;
    try {
        // ==========================================
        // ROUTE 1: GEMINI
        // ==========================================
        if (provider === 'gemini') {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey)
                throw new Error("GEMINI_API_KEY not found. Run 'swigit setup'");
            const genAI = new GoogleGenerativeAI(apiKey);
            // Updated to a current stable model
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
            const result = await model.generateContent(prompt);
            const response = result.response;
            return response.text().trim().replace(/`/g, "").replace(/\n/g, "");
        }
        // ==========================================
        // ROUTE 2: OPENAI
        // ==========================================
        else if (provider === 'openai') {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey)
                throw new Error("OPENAI_API_KEY not found. Run 'swigit setup'");
            // Use the ESM-friendly require
            const { OpenAI } = require("openai");
            const openai = new OpenAI({ apiKey });
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
            });
            return response.choices[0].message.content.trim().replace(/`/g, "").replace(/\n/g, "");
        }
        else {
            throw new Error(`Unsupported AI Provider: ${provider}`);
        }
    }
    catch (error) {
        console.error(chalk.red(`\n🤖 AI Error: ${error.message}`));
        if (error.message.includes("Cannot find module 'openai'")) {
            console.log(chalk.yellow("👉 Hint: Run 'npm install openai' to enable OpenAI integration."));
        }
        return "chore: structural updates"; // Improved fallback
    }
}
