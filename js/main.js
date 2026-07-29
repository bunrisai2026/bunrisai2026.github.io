// ナビゲーションの開閉、フッターの年表示だけを行う最小限のスクリプトです。
// 通常はここを編集する必要はありません。

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  navToggle.addEventListener("click", () => {
    siteNav.classList.toggle("open");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => siteNav.classList.remove("open"));
  });

  document.getElementById("year").textContent = new Date().getFullYear();
});
