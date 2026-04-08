import cors from "cors";
import express from "express";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "No legal issue provided." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are assisting with legal issue intake for informational purposes only.
Do not give legal advice.

Based on the user's description, identify up to 3 possible causes of action.

Use cautious language like:
- "possible"
- "may"
- "could"

Return ONLY valid JSON in this exact structure:
{
  "short_summary": "string",
  "possible_causes_of_action": [
    {
      "name": "string",
      "likelihood": "high" | "medium" | "low",
      "reason": "string",
      "missing_facts": ["string"]
    }
  ],
  "disclaimer": "This is informational only and not legal advice."
}
          `.trim(),
        },
        {
          role: "user",
          content: `User legal issue: ${text}`,
        },
      ],
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content;
    const parsed = JSON.parse(raw);

    res.json(parsed);
  } catch (error) {
    console.error("Analyze error:", error);
    res.status(500).json({ error: "Failed to analyze legal issue." });
  }
});