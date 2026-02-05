export async function onRequestGet(context) {
  const db = context.env.DB;

  const url = new URL(context.request.url);
  const number = String(url.searchParams.get("number") ?? "").trim();
  const bill_id = String(url.searchParams.get("bill_id") ?? "").trim();

  try {
    const send_user = await db
      .prepare("SELECT name FROM Users WHERE number = ?")
      .bind(number)
      .first();

    const request_user = await db
      .prepare("SELECT user_id FROM bill WHERE bill_id = ?")
      .bind(bill_id)
      .first();
    

    if (request_user?.user_id == number) {
      return Response.json({ ok: false, error: "請求者と支払い者が同じです" }, { status: 403 });
    }
    

    if (!send_user) {
      return Response.json({ ok: false, error: "口座番号が見つかりません" }, { status: 404 });
    }

    return Response.json({ ok: true, number});
  } catch (e) {
    return Response.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
