// ユーザーを全取得するAPI
export async function onRequestGet(context) {
  const db = context.env.DB; // 操作担当者が設定した"DB"という名前を使う

  try {
    // 全ユーザーを取得
    const { results } = await db.prepare("SELECT * FROM Users").all();
    return Response.json(results);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}