import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  console.log('today =', today);

  // data/predictions.json を読み込む
  const jsonText = fs.readFileSync('data/predictions.json', 'utf8');
  const allRows = JSON.parse(jsonText);

  // 今日の日付のレースだけに絞る
  const rows = allRows.filter((r) => r.race_date === today);

  if (rows.length === 0) {
    console.log('No predictions for today. Nothing to insert.');
    return;
  }

  console.log('Inserting rows:', rows);

  const { data, error } = await supabase
    .from('predictions')
    .insert(rows)
    .select();

  if (error) {
    console.error('Insert error:', error);
    process.exit(1);
  }

  console.log('✅ Inserted:', data);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
