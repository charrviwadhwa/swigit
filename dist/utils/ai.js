import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import path from 'path';
import os from 'os';
import { simpleGit } from 'simple-git';
// Force load from the correct Swigit folder
const globalEnvPath = path.join(os.homedir(), '.swigit', '.env');
dotenv.config({ path: globalEnvPath });
const git = simpleGit();
export async function generateCommitMessage() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
        throw new Error("GEMINI_API_KEY not found. Run 'swigit setup'");
    const diff = await git.diff(['--cached']);
    if (!diff)
        throw new Error("No staged changes.");
    const genAI = new GoogleGenerativeAI(apiKey);
    // Using your working model ID with the stable v1 API version
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, // Try 1.5-flash first with v1, fallback to 2.5 if needed
    { apiVersion: "v1" });
    const prompt = `Write a 1-line Conventional Commit for these changes:\n${diff.substring(0, 2000)}`;
    try {
        const result = await model.generateContent(prompt);
        return result.response.text().trim().replace(/`/g, "").replace(/\n/g, "");
    }
    catch (error) {
        // Fallback to exactly what worked for you before
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const res = await fallbackModel.generateContent(prompt);
        return res.response.text().trim();
    }
}
