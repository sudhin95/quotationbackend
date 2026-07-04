import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateQuotationDraft(userRequest) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a quotation assistant. Return structured JSON only.",
      },
      {
        role: "user",
        content: userRequest,
      },
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}