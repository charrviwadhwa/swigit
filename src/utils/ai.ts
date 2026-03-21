import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import { simpleGit } from 'simple-git';
import chalk from 'chalk';

// Load the .env file
dotenv.config();

const git = simpleGit();

// Pull the key from process.env
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(chalk.red("❌ Error: GEMINI_API_KEY not found in .env file."));
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateCommitMessage(): Promise<string> {
  try {
    // 1. Get the staged diff
    const diff = await git.diff(['--cached']);
    
    if (!diff) {
      console.log(chalk.red("❌ No staged changes found to analyze."));
      process.exit(1);
    }

    // 2. Build the Prompt
    const prompt = `
      Analyze the following git diff and write a concise, professional commit message.
      Use the Conventional Commits format (e.g., feat:, fix:, chore:, docs:, refactor:).
      The message should be a single line under 60 characters.
      
      Diff:
      ${diff.substring(0, 5000)} 
    `;

    // 3. Generate Content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim().replace(/`/g, ""); // Clean up any markdown backticks

  } catch (error) {
    console.error(chalk.red("🤖 AI Error: Could not generate message. Falling back to default."));
    return "update: structural changes";
  }
}