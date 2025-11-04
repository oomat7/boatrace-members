// scripts/update_predictions.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  // ★ 本当はここで「レースデータを取得して予想する」処理を書く
  //    まずは動作確認用に、ダミーデータを1件だけ入れてみます。

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const row = {
    race_date: today,
    stadium: '徳山',
    race_no: 1,
    tier: '一般戦',
    picks: '1-2-3, 1-3-2',
    notes: 'GitHub Actions 自動テスト',
    version: 1,
  };

  const { data, error } = await supabase
    .from('predictions')
    .insert(row)
    .select(); // 挿入結果を確認したいので select つけておく

  if (error) {
    console.error('insert error', error);
    process.exit(1);
  }

  console.log('inserted:', data);
}

main();
