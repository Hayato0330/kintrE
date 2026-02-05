export async function onRequestGet(context) {
  const db = context.env.DB;

  const url = new URL(context.request.url);
  const billId = url.searchParams.get("bill_id");
  
  if (!billId) {
    return Response.json({ error: "bill_idが必要です" }, { status: 400 });
  }

  try {
    // billテーブルから請求情報を取得
    const bill = await db
      .prepare("SELECT user_id, amount, message FROM bill WHERE bill_id = ?")
      .bind(billId)
      .first();

    if (!bill) {
      return Response.json({ error: "その請求は見つかりません" }, { status: 404 });
    }

    // user_idを使ってUsersテーブルから送信元の名前とnumberを取得
    const user = await db
      .prepare("SELECT name, number FROM Users WHERE number = ?")
      .bind(bill.user_id)
      .first();

    if (!user) {
      return Response.json({ error: "送信元のユーザーが見つかりません" }, { status: 404 });
    }

    return Response.json({
      bill_id: billId,
      amount: bill.amount,
      message: bill.message,
      sender_name: user.name,
      sender_id: bill.user_id,
      sender_number: user.number  // numberを追加（受取人のnumber）
    });
    
  } catch (e) {
    return Response.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}