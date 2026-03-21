import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as os from 'os';
import { simpleGit } from 'simple-git';
import chalk from 'chalk';

// 1. Tell dotenv EXACTLY where the global safe is
const globalEnvPath = path.join(os.homedir(), '.devgit', '.env');
dotenv.config({ path: globalEnvPath });

const git = simpleGit();

export async function generateCommitMessage(): Promise<string> {
  // 2. Read the preferred provider (defaults to gemini if not found)
  const provider = process.env.AI_PROVIDER || 'gemini';

  // 3. Grab the staged code changes
  const diff = await git.diff(['--cached']);
  if (!diff) {
    console.log(chalk.red("❌ No staged changes found to analyze."));
    process.exit(1);
  }

  const prompt = `Write a professional, concise, 1-line Conventional Commit message based on this git diff:\n${diff.substring(0, 3000)}`;

  try {
    console.log(chalk.gray(`🤖 Routing AI request to ${provider.toUpperCase()}...`));

    // ==========================================
    // ROUTE 1: GEMINI
    // ==========================================
    if (provider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY not found. Run 'devgit setup'");
      
      const genAI = new GoogleGenerativeAI(apiKey);
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
      if (!apiKey) throw new Error("OPENAI_API_KEY not found. Run 'devgit setup'");
      
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

  } catch (error: any) {
    console.error(chalk.red(`\n🤖 AI Error: ${error.message}`));
    
    // Helpful hint if they chose OpenAI but forgot to install the package
    if (error.message.includes("Cannot find module 'openai'")) {
        console.log(chalk.yellow("👉 Hint: Run 'npm install openai' in your DevGit folder to enable the OpenAI integration."));
    }
    
    return "update: structural changes"; // Safe fallback so DevGit doesn't crash
  }
}