const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  function setNavOpen(open) {
    siteNav.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
  }

  navToggle.addEventListener("click", () => {
    setNavOpen(!siteNav.classList.contains("open"));
  });
  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && siteNav.classList.contains("open")) {
      setNavOpen(false);
      navToggle.focus();
    }
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  try { initHeaderScroll(); } catch (e) { console.error(e); }
  try { initScrollReveal(); } catch (e) { console.error(e); }
  try { initEasedAnchorScroll(); } catch (e) { console.error(e); }
  try { initBackToTop(); } catch (e) { console.error(e); }
  try { initCountdown(); } catch (e) { console.error(e); }
  try { initHeroParallax(); } catch (e) { console.error(e); }
});

/* ---------- ヘッダー：ヒーロー上では透明、少しスクロールしたら不透明に ---------- */
function initHeaderScroll() {
  const header = document.getElementById("siteHeader");
  if (!header) return;
  const toggle = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
}

/* ---------- 文化祭までのカウントダウン ----------
   当日(2026/10/3 0:00)になった瞬間、この要素ごと非表示にする。
   HTML側で最初から hidden にしてあるので、何か失敗しても
   カウントダウンが出ないだけで、消えたコンテンツにはならない。 */
function initCountdown() {
  const el = document.getElementById("countdown");
  const daysEl = document.getElementById("cdDays");
  const hoursEl = document.getElementById("cdHours");
  const minutesEl = document.getElementById("cdMinutes");
  const secondsEl = document.getElementById("cdSeconds");
  if (!el || !daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const FESTIVAL_START = new Date(2026, 9, 3, 0, 0, 0); // 2026年10月3日(土) 0:00

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function update() {
    const diff = FESTIVAL_START - new Date();

    if (diff <= 0) {
      el.hidden = true;
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    daysEl.textContent = Math.floor(totalSeconds / 86400);
    hoursEl.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
    minutesEl.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
    secondsEl.textContent = pad(totalSeconds % 60);
    el.hidden = false;
  }

  update();
  setInterval(update, 1000);
}

function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  const toggle = () => {
    btn.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.6);
  };
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
}

/* ---------- スクロール演出 ----------
   .reveal（文字など）が対象。JSが失敗しても最初からコンテンツは見える
   （js-reveal クラスがCSS側の非表示ルールの起点になっているため）。
   写真(about-photo・access-photo)は消えるリスクを避けるため対象外。 */
function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (targets.length === 0) return;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    return;
  }

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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach((el) => observer.observe(el));
  } catch (e) {
    console.error(e);
    root.classList.remove("js-reveal");
  }
}

/* ---------- ヒーロー写真のごく控えめなパララックス ----------
   PCのみ・合計移動量は最大20px・reduced-motion時は無効。
   スマホ幅(900px以下)ではリスナー自体を付けない。 */
function initHeroParallax() {
  if (reduceMotion) return;
  const photo = document.getElementById("heroPhoto");
  const hero = document.getElementById("top");
  if (!photo || !hero) return;

  const MAX_SHIFT = 20;

  function isDesktop() {
    return window.innerWidth > 900;
  }

  function update() {
    if (!isDesktop()) {
      photo.style.transform = "";
      return;
    }
    const rect = hero.getBoundingClientRect();
    const progress = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
    const shift = progress * MAX_SHIFT;
    photo.style.transform = `translateY(${shift.toFixed(1)}px)`;
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

function initEasedAnchorScroll() {
  const header = document.querySelector(".site-header");
  const headerH = header ? header.offsetHeight : 0;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function scrollToTarget(target) {
    const startY = window.scrollY;
    const targetY = target.getBoundingClientRect().top + startY - headerH;

    if (reduceMotion) {
      window.scrollTo(0, targetY);
      return;
    }

    const distance = targetY - startY;
    const duration = 700;
    let startTime = null;

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      window.scrollTo(0, startY + distance * easeOutExpo(progress));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      scrollToTarget(target);
      history.pushState(null, "", `#${id}`);
    });
  });
}
