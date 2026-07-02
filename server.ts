import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is missing. Please add your Gemini API Key in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const systemPrompt = `You are "Auton AI", an expert QA Automation Engineer and Senior Software Developer.
Your sole task is to convert natural language test criteria, user stories, or manual test steps into production-ready, robust, and clean automation scripts using Playwright or Cypress.

Follow these strict best practices:
1. Framework-Specific Syntax:
   - For Playwright TypeScript (playwright-ts): Use 'import { test, expect } from "@playwright/test";'. Organize scripts using test.describe() and test() blocks. Use proper TypeScript types.
   - For Playwright JavaScript (playwright-js): Same as above but in standard JavaScript.
   - For Cypress (cypress): Use standard Cypress syntax, e.g., 'describe()' and 'it()', 'cy.visit()', and modern assertions.
2. Robust Selector Strategy:
   - Always prioritize modern user-facing semantic locators:
     * In Playwright: page.getByRole(), page.getByText(), page.getByLabel(), page.getByPlaceholder(), page.getByTestId().
     * In Cypress: cy.findByRole(), cy.findByPlaceholderText(), cy.findByLabelText(), or standard robust selectors.
   - Avoid brittle XPaths or deeply nested CSS class chains (e.g., 'div.header > ul > li > a').
3. Wait Mechanisms:
   - Rely on auto-waiting as much as possible.
   - Never use hardcoded sleeps like 'page.waitForTimeout(5000)' or 'cy.wait(5000)' unless absolutely necessary. Instead, use custom assertion waits or state waits.
4. Completeness:
   - Provide fully formed, executable test scripts. Do not write dummy placeholders or comments saying "implement here". All steps must be fully coded.
5. Structure:
   - If Page Object Model (POM) is requested, structure the response with the Page Class definition first (either inlined or clearly separated) followed by the tests.

Respond ONLY with a JSON object conforming to the schema.`;

// Endpoint: Generate Automation Script
app.post("/api/generate", async (req, res) => {
  try {
    const { framework, criteria, options = {} } = req.body;

    if (!criteria || !criteria.trim()) {
      return res.status(400).json({ error: "Test criteria is required." });
    }

    const ai = getGemini();

    const prompt = `Convert the following test criteria into a ${framework} automation script.
    
Test Criteria:
${criteria}

Options:
- Page Object Model (POM): ${options.pom ? "Yes, please structure using POM" : "No, standard inline test script"}
- Robust Locator Priority: ${options.robustSelectors ? "Yes, strictly prioritize getByRole, getByLabel, etc." : "Standard selector practices"}
- Viewport Config: ${options.includeViewport ? "Yes, configure viewport sizing" : "No special viewport config"}

Generate the fully-formed script conforming to the Auton AI standards.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            filename: {
              type: Type.STRING,
              description: "A valid, descriptive filename for the generated test file (e.g., auth.spec.ts or checkout.cy.js)."
            },
            code: {
              type: Type.STRING,
              description: "The complete, fully formed, production-ready, and formatted automation test code."
            },
            notes: {
              type: Type.STRING,
              description: "An 'Architect's Notes' section formatted in clean Markdown. Explain assumptions made, chosen selectors, wait strategies, and best practices."
            }
          },
          required: ["filename", "code", "notes"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response generated from Gemini API.");
    }

    const result = JSON.parse(resultText.trim());
    res.json(result);
  } catch (error: any) {
    console.error("Generation error:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred during generation." });
  }
});

// Endpoint: Refactor / Edit Existing Script
app.post("/api/refactor", async (req, res) => {
  try {
    const { framework, criteria, currentCode, instruction } = req.body;

    if (!currentCode || !currentCode.trim()) {
      return res.status(400).json({ error: "Current code is required for refactoring." });
    }
    if (!instruction || !instruction.trim()) {
      return res.status(400).json({ error: "Refactor instruction is required." });
    }

    const ai = getGemini();

    const prompt = `Refactor the following automation script based on the instruction.

Framework: ${framework}
Original Test Criteria (Context):
${criteria || "Not specified"}

Current Code:
\`\`\`
${currentCode}
\`\`\`

Refactor Instruction:
${instruction}

Please update the script to fully incorporate the instruction, preserving all other functional code. Conform strictly to the Auton AI best practices.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            filename: {
              type: Type.STRING,
              description: "The filename, updated if necessary based on the new steps or structure."
            },
            code: {
              type: Type.STRING,
              description: "The complete, refactored, fully formed automation test code."
            },
            notes: {
              type: Type.STRING,
              description: "Updated 'Architect's Notes' formatted in Markdown detailing the changes made, the new selectors or wait strategies."
            }
          },
          required: ["filename", "code", "notes"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response generated from Gemini API.");
    }

    const result = JSON.parse(resultText.trim());
    res.json(result);
  } catch (error: any) {
    console.error("Refactoring error:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred during refactoring." });
  }
});

// Start server function to handle Vite middleware in dev and static files in production
async function startServer() {
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
