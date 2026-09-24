/* =====================================================================
   文理祭2026 公式サイト スクリプト
   - どの機能も失敗しても他に影響しないよう、個別に try/catch している
   - JSが動かなくても全情報が読める(プログレッシブエンハンスメント)
   ===================================================================== */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  try { initMobileNav(); } catch (e) { console.error(e); }
  try { initHeaderScroll(); } catch (e) { console.error(e); }
  try { initNavSpy(); } catch (e) { console.error(e); }
  try { initScrollReveal(); } catch (e) { console.error(e); }
  try { initEasedAnchorScroll(); } catch (e) { console.error(e); }
  try { initBackToTop(); } catch (e) { console.error(e); }
  try { initCountdown(); } catch (e) { console.error(e); }
  try { initHeroParallax(); } catch (e) { console.error(e); }
  try { initShare(); } catch (e) { console.error(e); }
  try { initScheduleTabs(); } catch (e) { console.error(e); }
  try { initExhibitFilter(); } catch (e) { console.error(e); }
  try { initCategoryCounts(); } catch (e) { console.error(e); }
});

/* ---------- スマホメニュー ---------- */
function initMobileNav() {
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");
  const header = document.getElementById("siteHeader");
  if (!navToggle || !siteNav) return;

  function setNavOpen(open) {
    siteNav.classList.toggle("open", open);
    if (header) header.classList.toggle("menu-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
  }

  navToggle.addEventListener("click", () => setNavOpen(!siteNav.classList.contains("open")));
  siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setNavOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && siteNav.classList.contains("open")) {
      setNavOpen(false);
      navToggle.focus();
    }
  });
  // メニュー展開中は、メニューの外へTabで抜けたら閉じる(フォーカスが背後に隠れないように)
  document.addEventListener("focusin", (e) => {
    if (!siteNav.classList.contains("open")) return;
    if (siteNav.contains(e.target) || navToggle.contains(e.target)) return;
    setNavOpen(false);
  });
}

/* ---------- ヘッダー：ヒーロー上では透明、スクロールで不透明に ----------
   写真ヒーローの無いページでは最初から不透明(is-scrolled)に固定。 */
function initHeaderScroll() {
  const header = document.getElementById("siteHeader");
  if (!header) return;
  if (!document.querySelector(".hero-photo")) {
    header.classList.add("is-scrolled");
    return;
  }
  const toggle = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
}

/* ---------- ナビの現在地ハイライト ----------
   同じページ内の #id リンクだけが対象。見えているセクションに合わせて
   is-current を付ける。 */
function initNavSpy() {
  if (!("IntersectionObserver" in window)) return;
  const links = Array.from(document.querySelectorAll('.site-nav a[href^="#"], .subnav a[href^="#"]'));
  if (links.length === 0) return;

  const map = new Map();
  links.forEach((link) => {
    const target = document.getElementById(link.getAttribute("href").slice(1));
    if (target) map.set(target, link);
  });
  if (map.size === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const link = map.get(entry.target);
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach((l) => { if (l.closest(".site-nav, .subnav") === link.closest(".site-nav, .subnav")) l.classList.remove("is-current"); });
        link.classList.add("is-current");
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });

  map.forEach((_, target) => observer.observe(target));
}

/* ---------- 文化祭までのカウントダウン ----------
   10/3 0:00 までは残り時間、10/3〜10/4は「開催中」、10/5以降は「終了」を表示。
   HTML側で最初から hidden なので、失敗しても表示が壊れることはない。 */
function initCountdown() {
  const el = document.getElementById("countdown");
  const row = document.getElementById("countdownRow");
  const label = document.getElementById("countdownLabel");
  const state = document.getElementById("countdownState");
  const daysEl = document.getElementById("cdDays");
  const hoursEl = document.getElementById("cdHours");
  const minutesEl = document.getElementById("cdMinutes");
  const secondsEl = document.getElementById("cdSeconds");
  if (!el || !row || !label || !state || !daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const FESTIVAL_START = new Date(2026, 9, 3, 0, 0, 0);   // 2026年10月3日(土) 0:00
  const FESTIVAL_END   = new Date(2026, 9, 5, 0, 0, 0);   // 2026年10月4日(日) いっぱいまで

  const pad = (n) => String(n).padStart(2, "0");

  function update() {
    const now = new Date();

    if (now >= FESTIVAL_END) {
      row.hidden = true;
      label.hidden = true;
      state.hidden = false;
      state.textContent = "文理祭2026は終了しました";
      el.hidden = false;
      return true;
    }
    if (now >= FESTIVAL_START) {
      row.hidden = true;
      label.hidden = true;
      state.hidden = false;
      state.innerHTML = "";
      const dayNo = now.getDate() === 3 ? "1日目" : "2日目";
      state.append(document.createTextNode(`本日開催（${dayNo}）`));
      const badge = document.createElement("span");
      badge.className = "badge-live";
      badge.textContent = "開催中";
      state.append(badge);
      el.hidden = false;
      return true;
    }

    const totalSeconds = Math.floor((FESTIVAL_START - now) / 1000);
    daysEl.textContent = Math.floor(totalSeconds / 86400);
    hoursEl.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
    minutesEl.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
    secondsEl.textContent = pad(totalSeconds % 60);
    row.hidden = false;
    label.hidden = false;
    state.hidden = true;
    el.hidden = false;
    return false;
  }

  const done = update();
  if (!done) {
    const timer = setInterval(() => { if (update()) clearInterval(timer); }, 1000);
  }
}

/* ---------- 戻るボタン ---------- */
function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  const toggle = () => btn.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.6);
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
}

/* ---------- スクロール演出 ----------
   .reveal が対象。JSが動かない・失敗した時は最初から全部見える。 */
function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (targets.length === 0) return;
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  const root = document.documentElement;
  try {
    root.classList.add("js-reveal");
    const groups = new Map();
    targets.forEach((el) => {
      const parent = el.parentElement;
      const index = groups.has(parent) ? groups.get(parent) + 1 : 0;
      groups.set(parent, index);
      el.style.transitionDelay = `${Math.min(index, 4) * 60}ms`;
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    targets.forEach((el) => observer.observe(el));
  } catch (e) {
    console.error(e);
    root.classList.remove("js-reveal");
  }
}

/* ---------- ヒーロー写真のごく控えめなパララックス ----------
   PCのみ・合計移動量は最大20px・reduced-motion時は無効。 */
function initHeroParallax() {
  if (reduceMotion) return;
  const photo = document.getElementById("heroPhoto");
  const hero = document.getElementById("top");
  if (!photo || !hero) return;
  const MAX_SHIFT = 20;
  const isDesktop = () => window.innerWidth > 900;
  function update() {
    if (!isDesktop()) { photo.style.transform = ""; return; }
    const rect = hero.getBoundingClientRect();
    const progress = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
    photo.style.transform = `translateY(${(progress * MAX_SHIFT).toFixed(1)}px)`;
  }
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* ---------- ページ内リンクのなめらかなスクロール ---------- */
function initEasedAnchorScroll() {
  const header = document.querySelector(".site-header");
  const headerH = header ? header.offsetHeight : 0;
  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  function scrollToTarget(target) {
    const startY = window.scrollY;
    const targetY = target.getBoundingClientRect().top + startY - headerH - 16;
    if (reduceMotion) { window.scrollTo(0, targetY); return; }
    const distance = targetY - startY;
    const duration = 650;
    let startTime = null;
    function step(ts) {
      if (startTime === null) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      window.scrollTo(0, startY + distance * easeOutExpo(p));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // 移動先にフォーカスも移す。これをしないと「本文へ移動」などが
  // 見た目だけ動いて、キーボード操作では元の位置から進んでしまう。
  function focusTarget(el) {
    if (!el.hasAttribute("tabindex")) {
      el.setAttribute("tabindex", "-1");
      el.addEventListener("blur", () => el.removeAttribute("tabindex"), { once: true });
    }
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href").slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      scrollToTarget(target);
      focusTarget(target);
      history.pushState(null, "", `#${id}`);
    });
  });
}

/* ---------- 共有ボタン ----------
   対応端末では共有シートを開き、非対応ならURLをコピーして知らせる。 */
function initShare() {
  const btn = document.getElementById("shareBtn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const data = { title: document.title, url: location.href.split("#")[0] };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(data.url);
      showToast("ページのURLをコピーしました");
    } catch (err) {
      if (err && err.name === "AbortError") return;
      console.error(err);
      showToast("共有できませんでした");
    }
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

/* ---------- タイムスケジュール：スマホでは日付タブで切り替え ----------
   PC幅では2日分を並べて表示し、タブは非表示。 */
function initScheduleTabs() {
  const tabs = Array.from(document.querySelectorAll(".schedule-tab"));
  const days = Array.from(document.querySelectorAll(".schedule-day"));
  if (tabs.length === 0 || days.length === 0) return;

  const mq = window.matchMedia("(max-width: 900px)");
  let current = "1";

  function apply() {
    if (mq.matches) {
      days.forEach((d) => { d.hidden = d.dataset.day !== current; });
    } else {
      days.forEach((d) => { d.hidden = false; });
    }
    tabs.forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.day === current)));
  }

  tabs.forEach((t) => t.addEventListener("click", () => { current = t.dataset.day; apply(); }));
  if (mq.addEventListener) mq.addEventListener("change", apply); else mq.addListener(apply);
  apply();
}

/* ---------- 出し物一覧：検索・学年フィルタ・件数表示 ----------
   URLの ?q=文字列&grade=1 を初期値として読み、操作に合わせてURLも更新する。 */
function initExhibitFilter() {
  const search = document.getElementById("exhibitSearch");
  const countEl = document.getElementById("exhibitCount");
  const emptyEl = document.getElementById("exhibitEmpty");
  if (!search) return;

  const rows = Array.from(document.querySelectorAll(".exhibit-list .exhibit-row"));
  const sections = Array.from(document.querySelectorAll(".exhibit-list")).map((list) => ({
    list, section: list.closest("section"), rows: Array.from(list.querySelectorAll(".exhibit-row")),
  }));
  const radios = Array.from(document.querySelectorAll('input[name="grade"]'));
  if (rows.length === 0) return;

  // カテゴリーリンク（ページ上部）と各一覧の対応
  const navLinks = new Map();
  document.querySelectorAll('.subnav a[href^="#"]').forEach((a) => {
    const el = document.getElementById(a.getAttribute("href").slice(1));
    if (el) navLinks.set(el, a);
  });

  const normalize = (s) => String(s || "").normalize("NFKC").toLowerCase().replace(/\s+/g, "");
  // 検索対象: 企画名・団体名・場所・紹介文
  rows.forEach((row) => {
    const place = row.querySelector(".exhibit-place");
    const desc = row.querySelector(".exhibit-desc");
    row._hay = normalize([row.dataset.name, row.dataset.group, place && place.textContent, desc && desc.textContent].join(" "));
  });
  // data-grade は "1" "2" "3" "club" のほか、合同企画では "2 1" のように空白区切り
  const matchGrade = (row, grade) => !grade || row.dataset.grade.split(" ").includes(grade);

  function apply(updateUrl) {
    const q = normalize(search.value);
    const grade = (radios.find((r) => r.checked) || {}).value || "";
    let shown = 0;
    sections.forEach((sec) => {
      let n = 0;
      sec.rows.forEach((row) => {
        const ok = (!q || row._hay.includes(q)) && matchGrade(row, grade);
        row.hidden = !ok;
        if (ok) n += 1;
      });
      if (sec.section) {
        sec.section.hidden = n === 0;
        const link = navLinks.get(sec.section);
        if (link) link.classList.toggle("is-empty", n === 0);
      }
      shown += n;
    });
    if (countEl) countEl.innerHTML = `<strong>${shown}</strong> 件を表示（全${rows.length}件）`;
    if (emptyEl) emptyEl.hidden = shown !== 0;
    if (updateUrl) {
      const params = new URLSearchParams();
      if (search.value.trim()) params.set("q", search.value.trim());
      if (grade) params.set("grade", grade);
      const qs = params.toString();
      history.replaceState(null, "", `${location.pathname}${qs ? "?" + qs : ""}${location.hash}`);
    }
  }

  // URLパラメータからの初期値
  const params = new URLSearchParams(location.search);
  if (params.get("q")) search.value = params.get("q");
  const g = params.get("grade");
  if (g) { const r = radios.find((x) => x.value === g); if (r) r.checked = true; }

  search.addEventListener("input", () => apply(true));
  radios.forEach((r) => r.addEventListener("change", () => apply(true)));
  apply(false);
}

/* ---------- トップページ：出し物の件数を一覧ページから自動集計 ----------
   HTMLに書いてある件数は保険で、取得できたら上書きする。 */
function initCategoryCounts() {
  const countEl = document.getElementById("countClass");
  if (!countEl || !("fetch" in window)) return;

  const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  const hasGrade = (r, g) => String(r.dataset.grade || "").split(" ").includes(g);

  fetch("exhibits.html", { cache: "no-cache" })
    .then((res) => (res.ok ? res.text() : Promise.reject(new Error(res.status))))
    .then((html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const pick = (id) => Array.from(doc.querySelectorAll(`#${id} .exhibit-row`));
      const cls = pick("class-entries"), club = pick("club-entries"), stage = pick("stage-entries"), booth = pick("booth-entries");
      const total = cls.length + club.length + stage.length + booth.length;
      if (total === 0) return;
      setText("countClass", String(cls.length));
      setText("countClassSub", `1年 ${cls.filter((r) => hasGrade(r, "1")).length}件・2年 ${cls.filter((r) => hasGrade(r, "2")).length}件`);
      setText("countClub", String(club.length));
      setText("countStage", String(stage.length));
      setText("countBooth", String(booth.length));
      setText("countBoothSub", `3年 ${booth.filter((r) => hasGrade(r, "3")).length}件・部活動・団体 ${booth.filter((r) => hasGrade(r, "club")).length}件`);
      setText("aboutTotal", String(total));
    })
    .catch(() => { /* 取得できない場合はHTMLに書かれた件数のまま */ });
}
