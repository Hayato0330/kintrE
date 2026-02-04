export async function onRequestPost(context) {
  const db = context.env.DB; // wrangler.jsoncで設定したbinding名

  try {
    // 1. フロントエンドから送られてきたデータを受け取る
    // { account_number: 12345, amount: 1000, message: "割り勘", date: "2026-02-03..." }
    const body = await context.request.json();

    // バリデーション（必須項目のチェック）
    if (!body.account_number || !body.amount) {
      return Response.json({ error: "口座番号と金額は必須です" }, { status: 400 });
    }

    // 2. サーバー側で必要なデータを生成する
    const billId = crypto.randomUUID(); // ランダムなUUID (例: 550e8400-e29b...)
    const status = "INCOMPLETE";        // 初期状態

    // 日付はフロントから送られてきたものを使うか、なければ現在時刻を使う
    const createdAt = new Date().toISOString();

    // 3. データベースに保存する (INSERT)
    await db.prepare(
      "INSERT INTO bill (id, account_number, amount, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(billId, body.account_number, body.amount, body.message || "", status, createdAt)
    .run();
    
    // 生成されたリンク (例: https://.../pay.html?bill_id=550e8400...)
    // 1. 今のURL（http://localhost:8788 とか https://kintre...）を取得
    const origin = new URL(context.request.url).origin;

    // 2. それを使ってリンクを作る
    const paymentLink = `${origin}/pages/login?bill_id=${billId}`;

    return Response.json({ 
      success: true, 
      bill_id: billId,
      url: paymentLink 
    });

  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}