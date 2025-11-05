import 'dotenv/config';
import OpenAI from "openai";
import { createClient } from '@supabase/supabase-js';

// === Supabase 接続設定 ===
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

// === OpenAI 接続設定 ===
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// === スリープ関数（レート制限対策） ===
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log("=== 🧠 AI自動予想更新ジョブ開始 ===");
  const today = new Date().toISOString().slice(0, 10);

  // === 本日のレース情報を取得 ===
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

    // すでにAIコメントがある場合はスキップ（上書き防止）
    if (race.notes && race.notes.includes("🎯")) {
      console.log("↪ すでにAI予想あり、スキップ");
      continue;
    }

    // === 予想生成プロンプト ===
    const prompt = `
あなたはボートレース専門の予想AIです。
以下のレース情報をもとに、日本語で有料会員向けの詳しい予想解説を作成してください。

【レース情報】
- 日付: ${race.race_date}
- 場: ${race.stadium}
- レース番号: ${race.race_no}R
- グレード: ${race.tier || "一般戦"}
- 買い目(三連単): ${race.picks || "未設定"}

【出走メンバー】
1号艇: ${race.r1_name || "不明"}
2号艇: ${race.r2_name || "不明"}
3号艇: ${race.r3_name || "不明"}
4号艇: ${race.r4_name || "不明"}
5号艇: ${race.r5_name || "不明"}
6号艇: ${race.r6_name || "不明"}

【守ってほしいこと】
- 買い目は必ず「${race.picks || "未設定"}」の範囲内でコメントしてください。新しい組み合わせは勝手に増やさないでください。
- 選手名と艇番もできるだけ本文の中で触れてください（例: 「1号艇 平見はイン戦安定」など）。
- モーターや足色のコメントは「一般的な傾向」として表現してください。

【出力フォーマット】
🎯 フォーメーション予想
【本命】〜
【準本線】〜
【超穴】〜

⚙️ 決まり手想定＆信頼指標
逃げ：〜％
差し：〜％
まくり・まくり差し：〜％
その他：〜％

✅ 結論（精度重視最終形）
◎本命選手（理由）
○対抗選手（理由）
▲単穴選手（理由）
☆ヒモ穴（理由）

🎯 三連単最終買い目（精度優先）
必ず ${race.picks || "上記の買い目"} の中から選んでください。
`.trim();

    // === OpenAI 呼び出し ===
    let predictionText = "";
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      predictionText = response.choices[0].message.content.trim();
      console.log("🔵 生成コメント(先頭80文字):", predictionText.slice(0, 80) + "...");
    } catch (e) {
      if (e.status === 429 || e.code === "rate_limit_exceeded") {
        console.log("⚠️ OpenAIレート制限に達しました。次回再実行まで待機。");
        break; // 429が出たら一旦終了
      } else {
        console.error("❌ OpenAI生成エラー:", e);
        continue;
      }
    }

    // === 出走メンバーを先頭に付ける ===
    const racerLines = [];
    racerLines.push("【出走メンバー】");
    if (race.r1_name) racerLines.push(`1号艇：${race.r1_name}`);
    if (race.r2_name) racerLines.push(`2号艇：${race.r2_name}`);
    if (race.r3_name) racerLines.push(`3号艇：${race.r3_name}`);
    if (race.r4_name) racerLines.push(`4号艇：${race.r4_name}`);
    if (race.r5_name) racerLines.push(`5号艇：${race.r5_name}`);
    if (race.r6_name) racerLines.push(`6号艇：${race.r6_name}`);

    const finalNotes = racerLines.join("\n") + "\n\n" + predictionText;

    // === Supabase 更新 ===
    const { error: upErr } = await supabase
      .from("predictions")
      .update({ notes: finalNotes })
      .eq("id", race.id);

    if (upErr) {
      console.error("❌ Supabase更新エラー:", upErr);
    } else {
      console.log(`✅ 更新完了: ${race.stadium} ${race.race_no}R`);
    }

    // === 次の処理まで待機（レート制限回避） ===
    await sleep(25000); // 25秒間隔で次へ
  }

  console.log("=== 🎯 全レースAI生成完了 ===");
}

main().catch((err) => {
  console.error("❌ スクリプト全体エラー:", err);
  process.exit(1);
});
