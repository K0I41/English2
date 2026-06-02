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
        error: ".envにOPENAI_API_KEYが設定されていません。"
      });
    }

    const answers = req.body.answers;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        error: "回答データがありません。"
      });
    }

    const answerText = answers
      .map((answer, index) => {
        return `${index + 1}. ${answer.question}: ${answer.answer}（${answer.score}点）`;
      })
      .join("\n");

    const response = await client.responses.create({
      model,
      instructions: [
        "あなたは健康チェックアプリのアドバイス係です。",
        "医療診断や病名の断定はしないでください。",
        "生活習慣の目安として、短く優しい日本語で返してください。",
        "構成は「今日の健康チェック結果」「ひとことアドバイス」の2つにしてください。"
      ].join("\n"),
      input: `次の回答をもとに、今日の健康チェック結果を作ってください。\n\n${answerText}`
    });

    res.json({
      result: response.output_text
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "AIから結果を取得できませんでした。APIキーや利用上限を確認してください。"
    });
  }
});

app.listen(port, () => {
  console.log(`http://localhost:${port}/front.html で起動中`);
});
