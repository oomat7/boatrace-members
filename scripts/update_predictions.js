import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  // 今日の日付（YYYY-MM-DD）
  const today = new Date().toISOString().slice(0, 10);
  console.log('Today:', today);

  // JSONファイルを読み込む
  const jsonText = fs.readFileSync('data/predictions.json', 'utf8');
  const allRows = JSON.parse(jsonText);

  // 今日の日付のものだけ抽出
  const rows = allRows.filter(r => r.race_date === today);

  if (rows.length === 0) {
    console.log('今日分のレコードが JSON にありません。終了します。');
    return;
  }

  console.log(`JSON から ${rows.length} 件を登録します`);

  // 今日分を削除してから再挿入
  const { error: delError } = await supabase
    .from('predictions')
    .delete()
    .eq('race_date', today);
  if (delError) {
    console.error('Delete error:', delError);
    process.exit(1);
  }

  const { data, error } = await supabase
    .from('predictions')
    .insert(rows)
    .select();

  if (error) {
    console.error('Insert error:', error);
    process.exit(1);
  }

  console.log('✅ Inserted:', data.length, 'rows');
}

main().catch(e => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
