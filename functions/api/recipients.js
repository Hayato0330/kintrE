//2枚目のAPI
// フロントから「GET /api/recipients?exclude_number=1234567」のように呼ばれる
export async function onRequestGet(context) {
  const db = context.env.DB;

  // 1. URLから「除外したい自分の口座番号」を取得
  const url = new URL(context.request.url);
  const myAccountNumber = url.searchParams.get("exclude_number");

  if (!myAccountNumber) {
    return Response.json({ error: "自分の口座番号を指定してください" }, { status: 400 });
  }

  try {
    // 2. データベースから検索
    // "自分以外のユーザーの、ID・名前・アイコンを取得"
    const { results } = await db.prepare(
      "SELECT id, name, icon_url FROM Users WHERE account_number != ?"
    ).bind(myAccountNumber).all();

    // 3. 結果を返す
    return Response.json(results);

  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
