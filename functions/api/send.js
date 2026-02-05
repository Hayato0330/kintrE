export async function onRequestPost(context) {
  const db = context.env.DB;

  try {
    const body = await context.request.json();
    const { sender_number, recipient_number, amount } = body;

    // バリデーション
    if (!sender_number) {
      return Response.json({ error: "sender_numberが必要です" }, { status: 400 });
    }

    if (!recipient_number) {
      return Response.json({ error: "recipient_numberが必要です" }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return Response.json({ error: "正しい金額を指定してください" }, { status: 400 });
    }

    // 送金元のユーザー情報を取得
    const senderResult = await db
      .prepare("SELECT * FROM user WHERE number = ?")
      .bind(sender_number)
      .first();

    if (!senderResult) {
      return Response.json({ error: "送金元のユーザーが見つかりません" }, { status: 404 });
    }

    // 受取人のユーザー情報を取得
    const recipientResult = await db
      .prepare("SELECT * FROM user WHERE number = ?")
      .bind(recipient_number)
      .first();

    if (!recipientResult) {
      return Response.json({ error: "受取人のユーザーが見つかりません" }, { status: 404 });
    }

    // 残高チェック
    const senderBalance = Number(senderResult.balance);
    const sendAmount = Number(amount);

    if (senderBalance < sendAmount) {
      return Response.json({ error: "残高不足です" }, { status: 400 });
    }

    // 送金元の残高を減らす
    const updateSenderResult = await db
      .prepare("UPDATE user SET balance = balance - ? WHERE number = ?")
      .bind(sendAmount, sender_number)
      .run();

    if (updateSenderResult.changes === 0) {
      return Response.json({ error: "送金元の残高更新に失敗しました" }, { status: 500 });
    }

    // 受取人の残高を増やす
    const updateRecipientResult = await db
      .prepare("UPDATE user SET balance = balance + ? WHERE number = ?")
      .bind(sendAmount, recipient_number)
      .run();

    if (updateRecipientResult.changes === 0) {
      // ロールバック（送金元の残高を戻す）
      await db
        .prepare("UPDATE user SET balance = balance + ? WHERE number = ?")
        .bind(sendAmount, sender_number)
        .run();
      
      return Response.json({ error: "受取人の残高更新に失敗しました" }, { status: 500 });
    }

    // 更新後の残高を取得
    const updatedSender = await db
      .prepare("SELECT balance FROM user WHERE number = ?")
      .bind(sender_number)
      .first();

    const updatedRecipient = await db
      .prepare("SELECT balance FROM user WHERE number = ?")
      .bind(recipient_number)
      .first();

    return Response.json({
      success: true,
      message: "送金が完了しました",
      sender_number: sender_number,
      recipient_number: recipient_number,
      amount: sendAmount,
      sender_balance: updatedSender?.balance ?? 0,
      recipient_balance: updatedRecipient?.balance ?? 0
    });

  } catch (e) {
    return Response.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}