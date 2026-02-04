export async function onRequestGet(context) {
  const db = context.env.DB;

  const url = new URL(context.request.url);
  const number = String(url.searchParams.get("number") ?? "").trim();

  if (!number || !name) {
    return Response.json({ ok: false, error: "口座番号 が必要です" }, { status: 400 });
  }

  try {
    const user = await db
      .prepare("SELECT name FROM Users WHERE number = ?")
      .bind(number)
      .first();

    if (!user) {
      return Response.json({ ok: false, error: "口座番号が見つかりません" }, { status: 404 });
    }

    return Response.json({ ok: true, number});
  } catch (e) {
    return Response.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
