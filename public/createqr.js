// qr.js

(function () {
  // step7_2.html と同じキーから取得する
  const requestLink = sessionStorage.getItem("created_payment_link") || "";

  const canvas = document.getElementById("qrCanvas");
  const errEl = document.getElementById("qrErr");

  if (!canvas) return; // 画面構造が変わっていても落ちないようにする

  if (!requestLink || requestLink === "リンクが見つかりません") {
    if (errEl) errEl.textContent = "リンクが見つからないため，QRコードを表示できません．";
    return;
  }

  // QRコード生成（Canvasに描画）
  // ここでサイズなど調整可能
  QRCode.toCanvas(canvas, requestLink, {
    width: 220,
    margin: 1
  })
    .catch((e) => {
      console.error(e);
      if (errEl) errEl.textContent = "QRコードの生成に失敗しました．";
    });
})();
