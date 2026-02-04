export async function onRequestGet(context) {
  const db = context.env.DB;

  const url = new URL(context.request.url);
  const number = String(url.searchParams.get("number") ?? "").trim();
  const name   = String(url.searchParams.get("name") ?? "").trim();

  if (!number || !name) {
    return Response.json({ ok: false, error: "number と name が必要です" }, { status: 400 });
  }

  try {
    const user = await db
      .prepare("SELECT name FROM Users WHERE number = ?")
      .bind(number)
      .first();

    if (!user) {
      return Response.json({ ok: false, error: "口座番号が見つかりません" }, { status: 404 });
    }

    if (String(user.name).trim() !== name) {
      return Response.json({ ok: false, error: "名前が一致しません" }, { status: 401 });
    }

    return Response.json({ ok: true, number, name: user.name });
  } catch (e) {
    return Response.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
