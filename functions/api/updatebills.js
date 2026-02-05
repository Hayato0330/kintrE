export async function onRequestPut(context) {
  const db = context.env.DB;

  try {
    const body = await context.request.json();
    const { bill_id, user_id, amount } = body;

    if (!bill_id) {
      return Response.json({ error: "bill_idが必要です" }, { status: 400 });
    }

    if (!user_id) {
      return Response.json({ error: "user_idが必要です" }, { status: 400 });
    }

    // billテーブルを更新
    const result = await db
      .prepare("UPDATE bill SET status = ?, bill_user_id = ? WHERE bill_id = ?")
      .bind("complete", user_id, bill_id)
      .run();

    if (result.changes === 0) {
      return Response.json({ error: "該当する請求が見つかりません" }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: "請求が完了しました",
      bill_id: bill_id,
      status: "complete",
      bill_user_id: user_id,
      amount: amount // フロントエンドから渡されたamountを返す
    });

  } catch (e) {
    return Response.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}