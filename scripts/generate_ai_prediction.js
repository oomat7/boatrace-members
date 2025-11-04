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

  // Supabaseから本日のレース情報を取得
  const { data: races, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('race_date', today);

  if (error) throw error;
  if (!races || races.length === 0) {
    console.log("本日のデータがありません。");
    return;
  }

  for (const race of races) {
    // AIに出走データから予想文を生成させる
    const prompt = `
以下はボートレースの出走データです。
スタジアム：${race.stadium}
レース番号：${race.race_no}
フォーメーション：${race.picks}
展開メモ：${race.notes || "なし"}

上記をもとに、以下の形式で日本語でAI予想文を生成してください：
🎯 フォーメーション予想
【本命・信頼軸】と【穴・展開】を含む構成。
荒れ指数、決まり手想定、信頼度なども追加。
`;

    const ai = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    const prediction = ai.choices[0].message.content;

    // SupabaseにAI生成予想を登録
    const { error: upErr } = await supabase
      .from('predictions')
      .update({ notes: prediction })
      .eq('id', race.id);

    if (upErr) console.error(upErr);
    else console.log(`✅ ${race.stadium} ${race.race_no}R 登録完了`);
  }
}

main().catch(console.error);
