export async function onRequestGet(context) {
  const db = context.env.DB;

  const url = new URL(context.request.url);
  const number = url.searchParams.get("number");
  
  if (!number) {
    return Response.json({ error: "numberが必要です" }, { status: 400 });
  }

  try {
    //usersテーブルから口座残高を取得
    const users = await db
      .prepare("SELECT balance FROM users WHERE number = ?")
      .bind(number)
      .first();

    if (!users) {
      return Response.json({ error: "口座が見つかりません" }, { status: 404 });
    }


    return Response.json({
      balance: users.balance
    });
    
  } catch (e) {
    return Response.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}