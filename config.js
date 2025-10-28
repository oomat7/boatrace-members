// config.js

// 🔑 Supabase 接続設定
const SUPABASE_URL = "https://zlezokrsuxbqwepvaksj.supabase.co"; // ← あなたの Project URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmZzI...（省略）...N4gxA";

// 🌸 Supabase クライアントをグローバル変数に設定
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 動作確認ログ（Consoleに出ます）
console.log("✅ Supabase Client 読み込み完了:", window.supabaseClient);
