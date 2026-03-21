import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import { simpleGit } from 'simple-git';
import chalk from 'chalk';

// Load the .env file if it exists
dotenv.config();

const git = simpleGit();

export async function generateCommitMessage(): Promise<string> {
  // 1. We moved the check INSIDE the function!
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error(chalk.red("\n❌ Error: GEMINI_API_KEY not found."));
    console.log(chalk.yellow("👉 Please run 'devgit setup' to configure your API key.\n"));
    process.exit(1);
  }

  // 2. Initialize the AI only when we know we have the key
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const diff = await git.diff(['--cached']);
    
    if (!diff) {
      console.log(chalk.red("❌ No staged changes found to analyze."));
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

  } catch (error) {
    console.error(chalk.red("🤖 AI Error: Could not generate message."));
    return "update: structural changes";
  }
}