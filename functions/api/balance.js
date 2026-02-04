// balance.js

// URLパラメータから userId を取得
const params = new URLSearchParams(window.location.search);
const userId = params.get("userId");

if (!userId) {
  document.getElementById("limit").textContent = "取得失敗";
  console.error("userId がURLにありません");
} else {
  // users データベースから取得
  fetch(`/api/users?id=${encodeURIComponent(userId)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("APIエラー");
      }
      return response.json();
    })
    .then(user => {
      // balance（上限金額）を反映
      document.getElementById("limit").textContent = user.balance;
    })
    .catch(error => {
      console.error(error);
      document.getElementById("limit").textContent = "エラー";
    });
}