// config.js

// 🔑 Supabaseの接続設定
const SUPABASE_URL = "https://zlezokrsuxbqwepvaksj.supabase.co"; // ← あなたのProject URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsZXpva3JzdXhicXdlcHZha3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODcyMzIsImV4cCI6MjA3NTY2MzIzMn0.sVLzbwLfPkcabjskzP42bBiB_d1A26ZPWiNep-N4gxA";

// 🚀 Supabaseクライアントを使えるようにする
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
