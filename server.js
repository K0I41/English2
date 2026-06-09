import express from "express";
import OpenAI from "openai";
import "dotenv/config";

const app = express();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
const port = process.env.PORT || 3000;
const model = process.env.OPENAI_MODEL || "gpt-5-mini";

app.use(express.json());
app.use(express.static("."));

app.post("/api/health-check", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not set in .env."
      });
    }

    const answers = req.body.answers;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        error: "No answer data was provided."
      });
    }

    const answerText = answers
      .map((answer, index) => {
        return `${index + 1}. ${answer.question}: ${answer.answer} (${answer.score} points)`;
      })
      .join("\n");

    const response = await client.responses.create({
      model,
      instructions: [
        "You are the advice assistant for a health check app.",
        "Do not make medical diagnoses or identify diseases.",
        "Respond in short, kind English as lifestyle guidance only.",
        "Use two sections: 'Today's Health Check Result' and 'One-Point Advice'."
      ].join("\n"),
      input: `Create today's health check result based on the following answers.\n\n${answerText}`
    });

    res.json({
      result: response.output_text
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Could not get a result from AI. Please check your API key and usage limits."
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/front.html`);
});
