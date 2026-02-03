// 3枚目のAPI
export async function onRequestPost(context) {
  const db = context.env.DB;
  
  // フロントエンドから送られてきたデータを受け取る
  // { sender_id: 1, recipient_id: 2, amount: 1000, message: "ありがとう" }
  const body = await context.request.json();

  try {
    // 1. 送り主の残高チェック
    const sender = await db.prepare("SELECT balance FROM Users WHERE id = ?").bind(body.sender_id).first();
    if (!sender || sender.balance < body.amount) {
      return Response.json({ success: false, message: "残高不足です" }, { status: 400 });
    }

    // 2. まとめて実行（トランザクション）
    await db.batch([
      // 送り主から引く
      db.prepare("UPDATE Users SET balance = balance - ? WHERE id = ?").bind(body.amount, body.sender_id),
      // 相手に足す
      db.prepare("UPDATE Users SET balance = balance + ? WHERE id = ?").bind(body.amount, body.recipient_id),
      // 履歴に残す
      db.prepare("INSERT INTO Transactions (sender_id, recipient_id, amount, message) VALUES (?, ?, ?, ?)")
        .bind(body.sender_id, body.recipient_id, body.amount, body.message)
    ]);

    return Response.json({ success: true, message: "送金完了しました" });

  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}