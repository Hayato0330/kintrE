export async function onRequestPost(context) {
  const db = context.env.DB;

  try {
    const body = await context.request.json();

    // 必須チェック（message は任意）
    if (body.from_id === undefined || body.to_id === undefined || body.amount === undefined) {
      return Response.json(
        { error: "送金元ID，送信先ID，送金金額は必須です" },
        { status: 400 }
      );
    }

    // 型チェック（int想定なので整数に寄せる）
    const fromId = Number(body.from_id);
    const toId = Number(body.to_id);
    const amount = Number(body.amount);

    if (!Number.isInteger(fromId) || !Number.isInteger(toId) || !Number.isInteger(amount)) {
      return Response.json(
        { error: "from_id，to_id，amount は整数で指定してください" },
        { status: 400 }
      );
    }

    // ついでのバリデーション（好みで）
    if (amount <= 0) {
      return Response.json(
        { error: "amount は1以上にしてください" },
        { status: 400 }
      );
    }

    const message = (body.message ?? "").toString();

    // send テーブルへ INSERT
    await db
      .prepare("INSERT INTO send (from_id, to_id, amount, message) VALUES (?, ?, ?, ?)")
      .bind(fromId, toId, amount, message)
      .run();

    return Response.json({
      success: true,
      from_id: fromId,
      to_id: toId,
      amount: amount,
      message: message
    });

  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
