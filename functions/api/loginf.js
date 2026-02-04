export async function onRequestGet(context) {
  const db = context.env.DB;

  const url = new URL(context.request.url);
  const number = String(url.searchParams.get("number") ?? "").trim();
  const password = String(url.searchParams.get("password") ?? "").trim();

  try {
    const user = await db
      .prepare("SELECT password FROM Users WHERE number = ?")
      .bind(number)
      .first();

    if (!user) {
      return Response.json({ ok: false, error: "口座番号またはパスワードが違います" }, { status: 404 });
    }

    if (user.password !== password) {
      return Response.json({ ok: false, error: "口座番号またはパスワードが違います" }, { status: 401 });
    }

    return Response.json({ ok: true, number});
  } catch (e) {
    return Response.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
