import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const today = new Date().toISOString().slice(0, 10);

  const row = {
    race_date: today,
    stadium: '徳山',
    race_no: 1,
    tier: '一般戦',
    picks: '1-2-3, 1-3-2',
    notes: 'GitHub Actions 自動登録テスト',
    version: 1,
  };

  const { data, error } = await supabase
    .from('predictions')
    .insert(row)
    .select();

  if (error) {
    console.error('Insert error:', error);
    process.exit(1);
  }

  console.log('✅ Inserted:', data);
}

main();
