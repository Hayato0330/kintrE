export async function onRequestGet(context) {
  const db = context.env.DB;

  const url = new URL(context.request.url);
  const accountNumber = url.searchParams.get("number");
  if (!accountNumber) {
    return Response.json({ error: "口座番号が必要です" }, { status: 400 });
  }

  try {
    const user = await db
      .prepare("SELECT name, balance, aicon FROM Users WHERE number = ?")
      .bind(accountNumber)
      .first();

    if (!user) {
      return Response.json({ error: "その口座番号は見つかりません" }, { status: 404 });
    }

    return Response.json({
      account_number: accountNumber,
      name: user.name,
      balance: user.balance,
      icon_url: user.aicon,
    });
  } catch (e) {
    return Response.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}
