import dotenv from "dotenv";

dotenv.config();

export async function generateQuotationDraft(userRequest) {
  try {
    const response = await fetch(
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
              parts: [
                {
                 text: `
                        You are a senior software quotation expert.

                        All pricing MUST be based on Bahrain (Middle East) market rates in BHD (Bahraini Dinar).

                        Rules:
                        - Use Bahrain realistic development pricing (not US/India pricing)
                        - Currency must be BHD
                        - Assume average Bahrain freelance/agency rates
                        - Keep prices competitive for Bahrain SMEs
                        - Do NOT mention country in output unless asked
                        - Return ONLY valid JSON

                        JSON format:
                        {
                        "project_type": "",
                        "suggested_items": [
                            {
                            "title": "",
                            "description": "",
                            "quantity": 1,
                            "estimated_hours": 0,
                            "unitprice": 0,
                            "totalprice": 0
                            }
                        ],
                        "questions_to_ask_client": [],
                        "summary": ""
                        }

                        Request:
                        ${userRequest}
                        `,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return text;
  } catch (err) {
    console.error("Gemini Error:", err.message);
    throw err;
  }
}