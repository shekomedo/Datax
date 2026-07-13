import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  app.post("/api/smart-insights", async (req, res) => {
    try {
      const { profile, sampleData } = req.body;
      if (!profile || !sampleData) {
        return res.status(400).json({ error: "Missing profile or sampleData" });
      }

      const systemInstruction = `You are DataForge AI's Smart Insights engine.
Your task is to generate a natural-language summary of a dataset based on its profile and a sample of rows.
Generate a 3-paragraph summary covering:
1. Dataset shape and overview.
2. Key quality issues (missing values, duplicates, outliers).
3. Statistical findings and notable anomalies based on the sample.

Write in a professional, clear, and concise tone.`;

      const prompt = `Dataset Profile:
${JSON.stringify(profile, null, 2)}

Sample Data (first few rows):
${JSON.stringify(sampleData, null, 2)}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
            },
            required: ["summary"],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to generate insights" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
