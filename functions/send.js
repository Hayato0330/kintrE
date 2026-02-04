app.post("/api/pay", async (req, res) => {
  const { bill_id } = req.body;

  if (!bill_id) {
    return res.status(400).json({ error: "bill_idが必要です" });
  }

  try {
    await payBill(bill_id); // ← 前に書いた送金処理
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});