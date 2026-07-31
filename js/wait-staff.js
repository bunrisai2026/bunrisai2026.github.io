// スタッフ用の待ち時間更新ページ（staff.html）のロジック。
// 合言葉（STAFF_PIN）はFirestoreのセキュリティを担保するものではなく、
// 関係者以外がうっかりページを触らないようにするための簡易的なゲート。
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, onSnapshot, updateDoc, addDoc,
  deleteDoc, serverTimestamp, query, orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, STAFF_PIN } from "./wait-firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const boothsRef = collection(db, "booths");

const gateEl = document.getElementById("pinGate");
const panelEl = document.getElementById("staffPanel");
const pinForm = document.getElementById("pinForm");
const pinInput = document.getElementById("pinInput");
const pinError = document.getElementById("pinError");
const listEl = document.getElementById("staffBoothList");
const addForm = document.getElementById("addBoothForm");
const seedBtn = document.getElementById("seedBoothsBtn");

let booths = [];

// クラス企画（承認済み21件）の一括登録用データ。
// 「要検討」「著作権要確認」などがまだ付いている企画はここに含めていません。
const SEED_BOOTHS = [
  ["ジェットコースター", "1年AC1"],
  ["トイマニ", "1年AM1"],
  ["フォトスポット", "1年AM2"],
  ["お化け屋敷（コンセプトあり）", "1年AM3"],
  ["お化け屋敷（コンセプトあり）", "1年AM4"],
  ["占い", "1年C1"],
  ["お化け屋敷（コンセプトあり）", "1年D1"],
  ["お化け屋敷（コンセプトあり）", "1年D3"],
  ["お化け屋敷（コンセプトあり）", "1年D4"],
  ["トイマニ", "1年D6"],
  ["脱出ゲーム", "2年AC1"],
  ["トロッコシューティング", "2年AM3"],
  ["脱出ゲーム", "2年AM5"],
  ["カジノ", "2年AR1"],
  ["ラウンドワン", "2年C1"],
  ["ディズニーインスピレーション", "2年D1"],
  ["お化け屋敷", "2年D5"],
  ["お化け屋敷", "2年D6"],
  ["お化け屋敷", "2年D7"],
  ["トロッコアトラクション", "2年S1"],
  ["カーレース", "2年SP2"],
];

// タブを閉じるまでは合言葉の再入力を求めない
if (sessionStorage.getItem("staffAuthed") === "1") unlock();

pinForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (pinInput.value === STAFF_PIN) {
    sessionStorage.setItem("staffAuthed", "1");
    unlock();
  } else {
    pinError.hidden = false;
  }
});

function unlock() {
  gateEl.hidden = true;
  panelEl.hidden = false;
  subscribe();
}

function subscribe() {
  const boothsQuery = query(boothsRef, orderBy("order"));
  onSnapshot(boothsQuery, (snapshot) => {
    booths = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    render();
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function render() {
  listEl.innerHTML = booths.map((booth) => `
    <li class="staff-row" data-id="${booth.id}">
      <div class="staff-row-name">
        <strong>${escapeHtml(booth.name)}</strong>
        ${booth.location ? `<span class="staff-row-location">${escapeHtml(booth.location)}</span>` : ""}
      </div>
      <div class="staff-row-controls">
        <button type="button" class="step" data-delta="-5">−5</button>
        <button type="button" class="step" data-delta="-1">−1</button>
        <input type="number" class="wait-input" min="0" value="${booth.waitMinutes ?? 0}" aria-label="待ち時間（分）">
        <button type="button" class="step" data-delta="1">+1</button>
        <button type="button" class="step" data-delta="5">+5</button>
        <button type="button" class="btn btn-primary btn-small apply">更新</button>
      </div>
      <div class="staff-row-toggles">
        <button type="button" class="btn btn-outline btn-small toggle-closed">${booth.closed ? "受付を再開する" : "受付終了にする"}</button>
        <button type="button" class="delete-booth">削除</button>
      </div>
    </li>
  `).join("");
}

listEl.addEventListener("click", async (e) => {
  const row = e.target.closest(".staff-row");
  if (!row) return;
  const id = row.dataset.id;
  const input = row.querySelector(".wait-input");

  if (e.target.classList.contains("step")) {
    const delta = Number(e.target.dataset.delta);
    input.value = Math.max(0, Number(input.value || 0) + delta);
    return;
  }

  if (e.target.classList.contains("apply")) {
    await updateDoc(doc(boothsRef, id), {
      waitMinutes: Math.max(0, Number(input.value || 0)),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  if (e.target.classList.contains("toggle-closed")) {
    const booth = booths.find((b) => b.id === id);
    await updateDoc(doc(boothsRef, id), {
      closed: !booth.closed,
      updatedAt: serverTimestamp(),
    });
    return;
  }

  if (e.target.classList.contains("delete-booth")) {
    const booth = booths.find((b) => b.id === id);
    if (confirm(`「${booth.name}」を削除しますか？この操作は取り消せません。`)) {
      await deleteDoc(doc(boothsRef, id));
    }
  }
});

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = addForm.boothName.value.trim();
  if (!name) return;
  const maxOrder = booths.reduce((max, b) => Math.max(max, b.order ?? 0), 0);
  await addDoc(boothsRef, {
    name,
    location: addForm.location.value.trim(),
    waitMinutes: 0,
    closed: false,
    order: maxOrder + 1,
    updatedAt: serverTimestamp(),
  });
  addForm.reset();
});

seedBtn.addEventListener("click", async () => {
  if (!confirm(`クラス企画${SEED_BOOTHS.length}件を登録します。よろしいですか？`)) return;
  seedBtn.disabled = true;
  const maxOrder = booths.reduce((max, b) => Math.max(max, b.order ?? 0), 0);
  try {
    for (let i = 0; i < SEED_BOOTHS.length; i++) {
      const [name, location] = SEED_BOOTHS[i];
      await addDoc(boothsRef, {
        name,
        location,
        waitMinutes: 0,
        closed: false,
        order: maxOrder + i + 1,
        updatedAt: serverTimestamp(),
      });
    }
  } finally {
    seedBtn.disabled = false;
  }
});
