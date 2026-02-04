// Returns billing records for the given account number.
export async function onRequestGet(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);
  const accountNumber = String(url.searchParams.get("include_number") ?? "").trim();

  if (!accountNumber) {
    return Response.json({ error: "include_number is required" }, { status: 400 });
  }

  try {
    const { results } = await db
      .prepare(
        "SELECT bill_id, user_id, bill_user_id, amount, message, status, created_at FROM bill WHERE user_id = ? ORDER BY created_at DESC"
      )
      .bind(accountNumber)
      .all();


   const formattedResults = (results ?? []).map((bill) => {
      return {
        ...bill, // 元のデータ（bill_id, amountなど）をすべてコピー
        url: `https://kintre-pages.pages.dev/pages/login?${bill.bill_id}` // ★ここでURLを追加
      };
    });

    // 3. 加工したデータを返す
    return Response.json(formattedResults);
  } catch (e) {
    return Response.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}
