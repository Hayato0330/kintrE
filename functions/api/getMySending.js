export async function onRequestGet(context) {
  const db = context.env.DB;

  try {
    const url = new URL(context.request.url);
    const fromIdRaw = url.searchParams.get("from_id");

    if (fromIdRaw === null) {
      return Response.json(
        { error: "from_id が必要です" },
        { status: 400 }
      );
    }

    const fromId = Number(fromIdRaw);
    if (!Number.isInteger(fromId)) {
      return Response.json(
        { error: "from_id は整数で指定してください" },
        { status: 400 }
      );
    }

    // 履歴取得（新しい順にしたいなら ORDER BY rowid DESC）
    const result = await db
      .prepare("SELECT to_id, amount, message FROM send WHERE from_id = ? ORDER BY rowid DESC")
      .bind(fromId)
      .all();

    // D1の .all() は { results: [...] } 形式
    const rows = result.results ?? [];

    return Response.json({
      success: true,
      from_id: fromId,
      history: rows
    });

  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
