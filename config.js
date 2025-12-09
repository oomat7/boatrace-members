// ===============================
// Supabase 設定（モグオの本番URLに書き換える）
// ===============================
window.supabaseClient = supabase.createClient(
  "https://zlezokrsuxbqwepvaksj.supabase.co",   // ← モグオの Supabase URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsZXpva3JzdXhicXdlcHZha3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODcyMzIsImV4cCI6MjA3NTY2MzIzMn0.sVLzbwLfPkcabjskzP42bBiB_d1A26ZPWiNep-N4gxA"             // ← モグオの anon key
);

// ===============================
// Stripe：各プランの決済リンクを登録
// ===============================
window.planPaymentLinks = {
  // ライトプラン（880円/日）
  lite: "https://buy.stripe.com/test_cNi5kD5XEdui36m6sw0kE00",      

  // スタンダードプラン（3,980円/月）
  standard: "https://buy.stripe.com/test_28E8wP0DkgGuayO8AE0kE01",

  // プレミアムプラン（3,980円/月）
  premium: "https://buy.stripe.com/test_7sYaEX2Ls75UfT80480kE02"
};

// ===============================
// 必要なら他の共通設定もここへ追加してOK
// ===============================
