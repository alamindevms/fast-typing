import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to prevent crash on startup if key is missing as per guidelines
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it to your secrets configuration.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API endpoint to generate customized typing prompts
app.post("/api/generate-prompt", async (req, res) => {
  try {
    const { topic, level } = req.body;
    if (!topic) {
      res.status(400).json({ error: "Topic is required" });
      return;
    }

    const ai = getGeminiClient();
    
    // Set up standard constraints based on typing level
    let constraints = "standard vocabulary, simple punctuation, short words (mostly 3-6 letters). Make it extremely readable and cohesive.";
    if (level === "medium") {
      constraints = "moderate medical, tech, or historic terms, commas, capitals, and punctuation. Ensure a few longer words are included.";
    } else if (level === "hard") {
      constraints = "complex vocabulary, advanced coding snippets, numbers, rare capitals, semicolons, brackets, or other symbols. Keep it structurally challenging.";
    }

    const prompt = `Generate a single paragraph for a typing test about the topic: "${topic}".
Instructions:
1. It MUST be suited for a typing exercise at level: "${level}" (use ${constraints}).
2. It MUST be between 120 and 220 characters long.
3. It must consist of standard English letters, numbers, and basic punctuation.
4. Strictly avoid emojis, backticks, rare symbols, tabs, or newlines.
5. Provide ONLY the text of the generated paragraph. Do not include any titles, markdown blocks, quotes around the paragraph, or introductions. Give me the raw string directly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text?.trim() || "";
    if (!text) {
      throw new Error("Received empty content from Gemini API.");
    }

    res.json({ prompt: text });
  } catch (error: any) {
    console.error("Error invoking Gemini API:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate prompt. Please make sure your GEMINI_API_KEY is configured in Settings > Secrets." 
    });
  }
});

// Setup dev vs production environments
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    // Development server with Vite middleware on Port 3000
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production from dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched and listening on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start the Express server:", err);
});
