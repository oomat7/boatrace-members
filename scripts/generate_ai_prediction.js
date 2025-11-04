import OpenAI from "openai";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// OpenAI初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ChatGPTに予想を生成させる
async function generatePrediction(raceInfo) {
  const prompt = `
あなたは熟練のボートレース予想AIです。
以下の出走データをもとに、フォーメーション予想を出力してください。
出力形式はJSONで、"picks"と"notes"を含めてください。

出走データ:
${JSON.stringify(raceInfo, null, 2)}
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  // JSON抽出
  const text = response.choices[0].message.content;
  return JSON.parse(text);
}

// テスト用
(async () => {
  const raceInfo = {
    race_date: "2025-11-05",
    stadium: "若松",
    race_no: 12,
    tier: "本命",
  };

  const result = await generatePrediction(raceInfo);
  console.log("✅ 生成されたAI予想:", result);

  // 保存（次工程で使う）
  fs.writeFileSync("data/ai_result.json", JSON.stringify(result, null, 2));
})();
