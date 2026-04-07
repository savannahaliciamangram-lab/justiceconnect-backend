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
  const { summary, incidentDate, hasFiled, litigationStage } = req.body;

  const prompt = `
You are a legal intake assistant for Arizona civil matters.
Do NOT give legal advice.
Do NOT say representation exists.

User summary: ${summary}
Incident date: ${incidentDate}
Filed: ${hasFiled}
Stage: ${litigationStage || "Not provided"}

Return JSON:
{
  "caseType": "...",
  "claimStatus": "...",
  "timeliness": "...",
  "urgency": "...",
  "nextStep": "..."
}
`;

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const text = response.output_text;
    const parsed = JSON.parse(text);

    res.json(parsed);
  } catch (error) {
    console.error(error);
    res.json({
      caseType: "Possible civil issue",
      claimStatus: "Needs attorney review",
      timeliness: "Unknown",
      urgency: "Medium",
      nextStep: "Consult a legal aid organization",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});