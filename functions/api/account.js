// フロントから「GET /api/account?number=1234567」のように呼ばれたら動く
export async function onRequestGet(context) {
  const db = context.env.DB; // wrangler.jsoncで設定したDB

  // 1. URLから「口座番号(number)」を取り出す
  const url = new URL(context.request.url);
  const accountNumber = url.searchParams.get("number");

  // 口座番号が送られてこなかった場合のエラー処理
  if (!accountNumber) {
    return Response.json({ error: "口座番号が必要です" }, { status: 400 });
  }

  try {
    // 2. データベースから検索
    // "SELECT 名前, 残高, アイコン FROM Users WHERE 口座番号 = ?"
    const user = await db.prepare(
      "SELECT name, balance, icon_url FROM Users WHERE account_number = ?"
    ).bind(accountNumber).first();

    // ユーザーが見つからなかった場合
    if (!user) {
      return Response.json({ error: "その口座番号は見つかりません" }, { status: 404 });
    }

    // 3. 見つかったデータを返す
    return Response.json(user);

  } catch (e) {
    // サーバーエラー時
    return Response.json({ error: e.message }, { status: 500 });
  }
}