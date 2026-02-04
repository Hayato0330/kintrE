export async function onRequestPost(context) {
  const db = context.env.DB;

 const { number, password } = await context.request.json();

 if (!number || !password) {
      return Response.json({ ok: false, error: "未入力の項目があります" }, { status: 400 });
    }
    
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
