// このファイルは以下だけを行う最小限のスクリプトです。
// 通常はここを編集する必要はありません。
// 1) スマホ用メニューの開閉
// 2) フッターの年表示
// 3) ヒーローの粒子演出
// 4) スクロールで要素がふわっと現れる演出 / ナビのイージング付きスクロール
// 5) トップに戻るボタン

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  navToggle.addEventListener("click", () => siteNav.classList.toggle("open"));
  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => siteNav.classList.remove("open"));
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  // それぞれ独立して実行し、どれか1つが失敗しても他が止まらないようにする
  // （特にinitScrollRevealが動かないとコンテンツが消えたままになるため重要）
  try { initHeroParticles(); } catch (e) { console.error(e); }
  try { initScrollReveal(); } catch (e) { console.error(e); }
  try { initEasedAnchorScroll(); } catch (e) { console.error(e); }
  try { initBackToTop(); } catch (e) { console.error(e); }
});

/* ---------- 1. ヒーローの粒子演出 ---------- */
function initHeroParticles() {
  const canvas = document.getElementById("heroCanvas");
  const hero = canvas && canvas.closest(".hero");
  if (!canvas || !hero) return;

  const ctx = canvas.getContext("2d");
  const colors = ["255,229,96", "255,255,255"];
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

/* ---------- 2. スクロールで現れる演出 ----------
   .js-reveal を付けるのはここで観測を開始できると確認できたときだけ。
   途中で例外が出た場合も、catch 節で必ず解除して「表示されたまま」に戻す。 */
function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (targets.length === 0) return;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    return; // .js-reveal を付けないので、CSSの初期状態(表示)のまま
  }

  const root = document.documentElement;
  try {
    root.classList.add("js-reveal");

    // 同じセクション内で並んでいる要素は少しずつ遅れて現れるようにする
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

/* ---------- 3. ナビ・ボタンのイージング付きスクロール ---------- */
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

/* ---------- 4. トップに戻るボタン ---------- */
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
