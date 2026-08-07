const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  navToggle.addEventListener("click", () => siteNav.classList.toggle("open"));
  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => siteNav.classList.remove("open"));
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  try { initHeroParticles(); } catch (e) { console.error(e); }
  try { initScrollReveal(); } catch (e) { console.error(e); }
  try { initEasedAnchorScroll(); } catch (e) { console.error(e); }
  try { initBackToTop(); } catch (e) { console.error(e); }
  try { initCountdown(); } catch (e) { console.error(e); }
  try { initExhibitsShowMore(); } catch (e) { console.error(e); }
});

/* ---------- 出し物：最初は一部だけ表示し、ボタンで全部見せる（もう一度押すとたたむ） ---------- */
function initExhibitsShowMore() {
  const grid = document.querySelector(".card-grid");
  const btn = document.getElementById("exhibitsShowMore");
  if (!grid || !btn) return;

  const total = grid.querySelectorAll(".exhibit-card").length;
  const visibleByDefault = 6;
  const remaining = total - visibleByDefault;

  if (remaining <= 0) {
    btn.hidden = true;
    return;
  }

  const showLabel = `すべて表示（残り${remaining}件）`;
  const hideLabel = "たたむ";
  btn.textContent = showLabel;

  btn.addEventListener("click", () => {
    const expanded = grid.classList.toggle("show-all");
    btn.textContent = expanded ? hideLabel : showLabel;
    btn.setAttribute("aria-expanded", String(expanded));
    if (!expanded) {
      grid.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  });
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

function initHeroParticles() {
  const canvas = document.getElementById("heroCanvas");
  const hero = canvas && canvas.closest(".sheet-hero");
  if (!canvas || !hero) return;

  const ctx = canvas.getContext("2d");
  const colors = ["232,67,43", "255,182,39"];
  let width, height, dpr, particles = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticle() {
    return {
      x: Math.random() * width,
      y: height + Math.random() * 60,
      r: 1 + Math.random() * 2.4,
      speed: 0.25 + Math.random() * 0.6,
      drift: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.15 + Math.random() * 0.5,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function tick() {
    particles.forEach((p) => {
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -10) Object.assign(p, makeParticle(), { y: height + 10 });
    });
    draw();
    requestAnimationFrame(tick);
  }

  resize();
  particles = Array.from({ length: Math.min(Math.round((width * height) / 18000), 70) }, makeParticle);
  reduceMotion ? draw() : requestAnimationFrame(tick);
  window.addEventListener("resize", resize);
}

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
      el.style.transitionDelay = `${Math.min(index, 6) * 80}ms`;
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
