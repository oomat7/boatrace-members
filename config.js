// config.js

// 🔑 Supabase の接続設定
//   SUPABASE_URL: Supabase ダッシュボード > Project Settings > API > Project URL
//   SUPABASE_ANON_KEY: 同じ画面の「anon public」キー
const SUPABASE_URL = "https://zlezokrsuxbqwepvaksj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsZXpva3JzdXhicXdlcHZha3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODcyMzIsImV4cCI6MjA3NTY2MzIzMn0.sVLzbwLfPkcabjskzP42bBiB_d1A26ZPWiNep-N4gxA";

// ここが大事：ダッシュボードからコピペしたキー以外は
// 一切入れないでください（日本語コメントも入れない）

// 例）こんな書き方は NG
// const SUPABASE_ANON_KEY = "xxxx...N4gxA（ここに貼る）";  ← これだと全角カッコが混ざる

// Supabase クライアントを作成して window にぶら下げる
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
