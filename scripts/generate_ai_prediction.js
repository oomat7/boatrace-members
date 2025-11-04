import 'dotenv/config';
import OpenAI from "openai";
import { createClient } from '@supabase/supabase-js';

// Supabase 接続設定
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

// OpenAI 接続設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function main() {
  const today = new Date().toISOString().slice(0, 10);

  // 本日のレース情報を取得
  const { data: races, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('race_date', today)
    .order('stadium', { ascending: true })
    .order('race_no', { ascending: true });

  if (error) throw error;
  if (!races || races.length === 0) {
    console.log("本日のデータがありません。");
    return;
  }

  for (const race of races) {
    console.log(`🟦 AI生成中: ${race.stadium} ${race.race_no}R`);

    const prompt = `
あなたはボートレース専門の予想AIです。
以下のレース情報をもとに、日本語で詳しい予想解説を作成してください。

【レース情報】
- 日付: ${race.race_date}
- 場: ${race.stadium}
- レース番号: ${race.race_no}R
- グレード: ${race.tier || "一般戦"}
- 買い目(三連単): ${race.picks || "未設定"}

【必ず守るルール】
- 買い目は「${race.picks || "未設定"}」の中だけを使ってください。新しい組み合わせは勝手に増やさないでください。
- トーンは「有料会員向けの丁寧な予想コメント」風。
- 絵文字は使ってOKですが多すぎないように。

【出力フォーマット（この形で書いてください）】

🎯 フォーメーション予想
【本命：信頼軸】
ここに本命となる買い目と簡単な理由（上の買い目から選んでください）

【準本線（やや荒れ想定）】
ここに準本線となる買い目と理由

【超穴（展開ハマり）】
ここに穴目となる買い目と理由

⚙️ 決まり手想定＆信頼指標
逃げ：◯◯％
差し：◯◯％
まくり・まくり差し：◯◯％
その他：◯◯％
簡単なコメント（例：イン有利、センター勢が怖い など）

✅ 結論（精度重視最終形）
◎本命選手
○対抗
▲単穴
☆ヒモ穴
（上から順に理由も1行ずつ）

🎯 三連単最終買い目（精度優先）
ここに最終的に買うべき三連単を列挙（必ず ${race.picks || "上記の買い目"} の中から選ぶこと）
`.trim();

    const ai = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const predictionText = ai.choices[0].message.content.trim();
    console.log("🔵 生成コメント:", predictionText.slice(0, 80) + "...");

    // Supabaseの notes を AIコメントで更新
    const { error: upErr } = await supabase
      .from('predictions')
      .update({ notes: predictionText })
      .eq('id', race.id);

    if (upErr) {
      console.error("❌ 更新エラー:", upErr);
    } else {
      console.log(`✅ 更新完了: ${race.stadium} ${race.race_no}R`);
    }
  }
}

main().catch((err) => {
  console.error("❌ スクリプト全体エラー:", err);
  process.exit(1);
});
