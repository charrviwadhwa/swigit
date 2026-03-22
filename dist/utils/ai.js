import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as os from 'os';
import { simpleGit } from 'simple-git';
import chalk from 'chalk';
import { createRequire } from 'module';
// 1. Tell dotenv EXACTLY where the global Swigit vault is
const globalEnvPath = path.join(os.homedir(), '.swigit', '.env');
dotenv.config({ path: globalEnvPath });
const git = simpleGit();
const require = createRequire(import.meta.url);
export async function generateCommitMessage() {
    const provider = process.env.AI_PROVIDER || 'gemini';
    const diff = await git.diff(['--cached']);
    if (!diff) {
        console.log(chalk.red("❌ No staged changes found to analyze."));
        process.exit(1);
    }
    const prompt = `Write a professional, concise, 1-line Conventional Commit message based on this git diff:\n${diff.substring(0, 3000)}`;
    try {
        console.log(chalk.gray(`🤖 Routing AI request to ${provider.toUpperCase()}...`));
        if (provider === 'gemini') {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey)
                throw new Error("GEMINI_API_KEY not found. Run 'swigit setup'");
            const genAI = new GoogleGenerativeAI(apiKey);
            // 👉 THE FIX: Use gemini-1.5-flash and force the STABLE v1 API
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim().replace(/`/g, "").replace(/\n/g, "");
        }
        else if (provider === 'openai') {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey)
                throw new Error("OPENAI_API_KEY not found. Run 'swigit setup'");
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
            console.log(chalk.yellow("👉 Hint: Run 'npm install openai' to enable the OpenAI integration."));
        }
        return "chore: structural updates";
    }
}
