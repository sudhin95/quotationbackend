import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPT_PATH = path.join(__dirname, "..", "prompts", "quotation-draft.md");

let cachedTemplate = null;

function loadPromptTemplate() {
  if (cachedTemplate) return cachedTemplate;
  try {
    cachedTemplate = fs.readFileSync(PROMPT_PATH, "utf-8");
    return cachedTemplate;
  } catch (err) {
    throw new Error("PROMPT_TEMPLATE_MISSING: " + err.message);
  }
}

export async function generateQuotationDraft(userRequest) {
  const template = loadPromptTemplate();
  const finalPrompt = template.replace("{{USER_PROMPT}}", userRequest);

  let response;
  try {
    response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: finalPrompt }],
            },
          ],
        }),
        signal: AbortSignal.timeout(20000), // 20s timeout guard
      }
    );
  } catch (err) {
    // Network failure, DNS error, timeout, etc.
    console.error("Gemini network error:", err.message);
    throw new Error("AI_CALL_FAILED: " + err.message);
  }

  if (!response.ok) {
    let errBody = "";
    try {
      errBody = await response.text();
    } catch (_) {
      // ignore secondary failure reading error body
    }
    console.error(`Gemini API error (${response.status}):`, errBody);
    throw new Error(`AI_CALL_FAILED: Gemini responded with status ${response.status}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    console.error("Gemini response was not valid JSON envelope:", err.message);
    throw new Error("AI_EMPTY_RESPONSE: Could not parse Gemini response");
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!text.trim()) {
    console.error("Gemini returned an empty candidate:", JSON.stringify(data));
    throw new Error("AI_EMPTY_RESPONSE: Gemini returned no content");
  }

  // Strip accidental markdown fences before JSON.parse downstream
  return text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}