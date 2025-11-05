import 'dotenv/config';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Supabase 接続設定
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

// OpenAI 接続設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
    console.log('本日のデータがありません。');
    return;
  }

  for (const race of races) {
    console.log(
      `🟦 AI生成中: ${race.stadium ?? '場不明'} ${race.race_no ?? '?'}R`
    );

    // 選手名（undefined なら空文字にして渡す）
    const n1 = race.r1_name ?? '';
    const n2 = race.r2_name ?? '';
    const n3 = race.r3_name ?? '';
    const n4 = race.r4_name ?? '';
    const n5 = race.r5_name ?? '';
    const n6 = race.r6_name ?? '';

    const prompt = `
あなたはボートレース専門の予想AIです。
以下のレース情報をもとに、日本語で有料会員向けの詳しい予想解説を作成してください。

【レース情報】
- 日付: ${race.race_date}
- 場: ${race.stadium}
- レース番号: ${race.race_no}R
- グレード: ${race.tier || '一般戦'}
- 買い目(三連単): ${race.picks || '未設定'}

【出走メンバー（実際の選手名。空欄なら触れなくてよい）】
- 1号艇: ${n1}
- 2号艇: ${n2}
- 3号艇: ${n3}
- 4号艇: ${n4}
- 5号艇: ${n5}
- 6号艇: ${n6}

【守ってほしいこと】
- 買い目のコメントは必ず「${race.picks || '未設定'}」の範囲内で書いてください。新しい組み合わせは勝手に増やさないでください。
- 本文の中では、可能なら「1号艇 ${n1}」「2号艇 ${n2}」のように、艇番と選手名の両方に触れてください（ただし名前が空欄の場合は無理に書かなくてよい）。
- モーターや足色のコメントは「一般的な傾向」としての表現にとどめ、実際の公式データがあるとは限らない前提で書いてください。

【出力フォーマット（この形で書いてください）】

🎯 フォーメーション予想
【本命：信頼軸】
ここに本命となる買い目と簡単な理由（上の買い目から選ぶこと）

【準本線（やや荒れ想定）】
ここに準本線となる買い目と理由

【超穴（展開ハマり）】
ここに穴目となる買い目と理由

⚙️ 決まり手想定＆信頼指標
逃げ：◯◯％
差し：◯◯％
まくり・まくり差し：◯◯％
その他：◯◯％
簡単なコメント（例：イン有利／センター勢が怖い 等）

✅ 結論（精度重視最終形）
◎本命：1号艇 ${n1 || '（名前未登録）'}
○対抗：2号艇 ${n2 || '（名前未登録）'}
▲単穴：3号艇 ${n3 || '（名前未登録）'}
☆ヒモ穴：4号艇 ${n4 || '（名前未登録）'}
※上から順に理由も1行ずつ書いてください。

🎯 三連単最終買い目（精度優先）
ここに最終的に推奨する三連単を列挙（必ず ${race.picks || '上記の買い目'} の中から選ぶ）
`.trim();

    const ai = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const predictionText = ai.choices[0].message.content.trim();
    console.log(
      '🔵 生成コメント(先頭):',
      predictionText.slice(0, 80).replace(/\s+/g, ' ') + '...'
    );

    // ★ notes 先頭に必ず「出走メンバー」ブロックを付ける
    const racerLines = [];
    if (n1 || n2 || n3 || n4 || n5 || n6) {
      racerLines.push('【出走メンバー】');
      if (n1) racerLines.push(`1号艇：${n1}`);
      if (n2) racerLines.push(`2号艇：${n2}`);
      if (n3) racerLines.push(`3号艇：${n3}`);
      if (n4) racerLines.push(`4号艇：${n4}`);
      if (n5) racerLines.push(`5号艇：${n5}`);
      if (n6) racerLines.push(`6号艇：${n6}`);
    }

    let finalNotes = predictionText;
    if (racerLines.length > 0) {
      finalNotes = racerLines.join('\n') + '\n\n' + predictionText;
    }

    // Supabase の notes を更新（古いテキストを丸ごと上書き）
    const { error: upErr } = await supabase
      .from('predictions')
      .update({ notes: finalNotes })
      .eq('id', race.id);

    if (upErr) {
      console.error('❌ 更新エラー:', upErr);
    } else {
      console.log(`✅ 更新完了: ${race.stadium} ${race.race_no}R`);
    }
  }
}

main().catch((err) => {
  console.error('❌ スクリプト全体エラー:', err);
  process.exit(1);
});
