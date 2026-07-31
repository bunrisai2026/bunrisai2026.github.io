// 来場者用の待ち時間ページ（wait.html）のロジック。
// Firestoreの booths コレクションをリアルタイムに購読し、変更があった瞬間に画面へ反映する。
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, onSnapshot, query, orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./wait-firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const listEl = document.getElementById("boothList");
const emptyEl = document.getElementById("emptyState");
const errorEl = document.getElementById("loadError");

let booths = [];

const boothsQuery = query(collection(db, "booths"), orderBy("order"));
onSnapshot(
  boothsQuery,
  (snapshot) => {
    booths = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    errorEl.hidden = true;
    render();
  },
  (err) => {
    console.error(err);
    errorEl.hidden = false;
  }
);

function formatWait(booth) {
  if (booth.closed) return "受付終了";
  if (!booth.waitMinutes) return "待ちなし";
  return `約${booth.waitMinutes}分`;
}

function formatUpdated(timestamp) {
  if (!timestamp) return "";
  const minutes = Math.floor((Date.now() - timestamp.toDate().getTime()) / 60000);
  if (minutes < 1) return "たった今更新";
  if (minutes < 60) return `${minutes}分前に更新`;
  return `${Math.floor(minutes / 60)}時間前に更新`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function render() {
  if (booths.length === 0) {
    emptyEl.hidden = false;
    listEl.innerHTML = "";
    return;
  }
  emptyEl.hidden = true;
  listEl.innerHTML = booths.map((booth) => `
    <li class="wait-card${booth.closed ? " is-closed" : ""}">
      <div class="wait-card-main">
        <p class="wait-card-name">${escapeHtml(booth.name)}</p>
        ${booth.location ? `<p class="wait-card-location">${escapeHtml(booth.location)}</p>` : ""}
      </div>
      <div class="wait-card-time">
        <p class="wait-card-minutes">${formatWait(booth)}</p>
        <p class="wait-card-updated">${formatUpdated(booth.updatedAt)}</p>
      </div>
    </li>
  `).join("");
}

// 「◯分前に更新」の表示を最新に保つため、30秒ごとに再描画する（Firestoreへの再取得はしない）
setInterval(render, 30000);
