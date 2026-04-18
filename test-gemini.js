import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
async function run() {
  const models = await genAI.getGenerativeModel({ model: "whatever" });
  console.log("We need to list models...");
}
run();
