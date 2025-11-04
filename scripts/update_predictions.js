import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname 相当を作る（ESMなのでこう書く）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  console.log('today =', today);

  // JSONファイルのパス（scripts から見て ../data/predictions.json）
  const jsonPath = path.join(__dirname, '../data/predictions.json');
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const allRows = JSON.parse(raw);

  // 今日の日付のレースだけに絞り込み
  const todaysRows = allRows.filter((r) => r.race_date === today);

  if (todaysRows.length === 0) {
    console.log('No predictions for today. Nothing to insert.');
    return;
  }

  console.log('Inserting rows:', todaysRows);

  const { data, error } = await supabase
    .from('predictions')
    .insert(todaysRows)
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
