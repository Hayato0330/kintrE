export async function onRequestGet(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);

  // デバッグ：テーブルに何が入っているか確認
  if (url.searchParams.get("debug") === "1") {
    try {
      const any = await db.prepare("SELECT number, name, balance, aicon FROM Users LIMIT 1").first();
      const cnt = await db.prepare("SELECT COUNT(*) AS c FROM Users").first();
      return Response.json({ count: cnt?.c ?? null, sample: any ?? null });
    } catch (e) {
      return Response.json({ error: e?.message ?? String(e) }, { status: 500 });
    }
  }

  const accountNumber = url.searchParams.get("number");
  if (!accountNumber) {
    return Response.json({ error: "口座番号が必要です" }, { status: 400 });
  }

  try {
    const user = await db
      .prepare("SELECT number, name, balance, aicon FROM Users WHERE number = ?")
      .bind(accountNumber)
      .first();

    if (!user) {
      return Response.json({ error: "その口座番号は見つかりません" }, { status: 404 });
    }

    return Response.json({
      account_number: user.number,
      name: user.name,
      balance: user.balance,
      icon_url: user.aicon,
    });
  } catch (e) {
    return Response.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}
