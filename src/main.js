/* ============================================================
   St1pa4 — веб дизайн · interactions
   ============================================================ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined";

  if (hasGsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  const scrollToTarget = (target) => {
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.4 });
    } else if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
    } else {
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  /* ---------- Intro overlay: dismisses on scroll down ---------- */
  const intro = document.getElementById("intro");
  const introSkip = document.getElementById("introSkip");
  let introDone = false;

  const dismissIntro = () => {
    if (introDone) return;
    introDone = true;
    document.body.classList.add("is-ready"); // плавно проявляет фон
    if (hasGsap && !reduceMotion) {
      gsap.to(intro, {
        yPercent: -100,
        duration: 0.9,
        ease: "power3.inOut",
        onComplete: () => { intro.remove(); },
      });
    } else {
      intro.style.transition = "transform 0.5s ease";
      intro.style.transform = "translateY(-100%)";
      setTimeout(() => intro.remove(), 550);
    }
    intro.setAttribute("aria-hidden", "true");
  };

  if (intro) {
    if (lenis) {
      lenis.on("scroll", ({ scroll }) => {
        // gentle parallax of the overlay content while the page moves beneath
        const inner = intro.querySelector(".intro__inner");
        if (inner && !introDone) inner.style.transform = "translateY(" + -scroll * 0.25 + "px)";
        if (!introDone && scroll > 8) dismissIntro();
      });
    } else {
      window.addEventListener("scroll", () => {
        if (!introDone && window.scrollY > 8) dismissIntro();
      }, { passive: true });
    }
    introSkip.addEventListener("click", dismissIntro);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !introDone) dismissIntro();
    });
  }

  /* ---------- Anchor navigation through Lenis ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (!introDone && intro) dismissIntro();
      // wait a tick so the overlay unlock does not swallow the target jump
      setTimeout(() => scrollToTarget(el), introDone ? 0 : 350);
    });
  });

  /* ---------- Text splitting: chars (hero) & lines (titles) ---------- */
  const splitChars = (el) => {
    const text = el.textContent;
    el.textContent = "";
    const frag = document.createDocumentFragment();
    for (const ch of text) {
      const mask = document.createElement("span");
      mask.className = "char-mask";
      const inner = document.createElement("span");
      inner.className = "char";
      inner.textContent = ch === " " ? " " : ch;
      mask.appendChild(inner);
      frag.appendChild(mask);
    }
    el.appendChild(frag);
    return el.querySelectorAll(".char");
  };

  const splitLines = (el) => {
    // wrap the whole element in a line mask (single-line clip reveal)
    const parent = el.parentNode;
    const wrapper = document.createElement("span");
    wrapper.className = "line-mask";
    const line = document.createElement("span");
    line.className = "line";
    parent.insertBefore(wrapper, el);
    wrapper.appendChild(line);
    line.appendChild(el);
    return [line];
  };

  /* ---------- Load-in + scroll reveals ---------- */
  if (hasGsap && !reduceMotion) {
    // hero char cascade
    document.querySelectorAll(".split-chars").forEach((row) => {
      const chars = splitChars(row);
      gsap.from(chars, {
        yPercent: 118,
        rotate: 3,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.022,
        delay: 0.15,
      });
    });

    gsap.from(".hero__kicker", { opacity: 0, y: 18, duration: 0.9, ease: "power3.out", delay: 0.1 });
    gsap.from(".hero__meta", { opacity: 0, duration: 1.1, delay: 0.9, ease: "power2.out" });

    // generic reveal-line items
    document.querySelectorAll(".reveal-line").forEach((el) => {
      if (el.closest(".hero")) return; // already handled
      gsap.from(el, {
        opacity: 0, y: 26, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });

    // section titles: line-mask rise
    document.querySelectorAll(".split-lines").forEach((title) => {
      const lines = splitLines(title);
      gsap.from(lines, {
        yPercent: 110, duration: 1.1, ease: "power4.out", stagger: 0.08,
        scrollTrigger: { trigger: title, start: "top 85%", once: true },
      });
    });

    // service columns rise with slight stagger
    gsap.from(".svc", {
      opacity: 0, y: 60, duration: 1, ease: "power3.out", stagger: 0.12,
      scrollTrigger: { trigger: ".services__grid", start: "top 82%", once: true },
    });

    // discount contents
    gsap.from(".discount > *", {
      opacity: 0, y: 34, duration: 0.9, ease: "power3.out", stagger: 0.1,
      scrollTrigger: { trigger: ".discount", start: "top 75%", once: true },
    });

    // contact rows
    gsap.from(".contacts__list li", {
      opacity: 0, y: 30, duration: 0.8, ease: "power3.out", stagger: 0.09,
      scrollTrigger: { trigger: ".contacts__list", start: "top 82%", once: true },
    });

    // marquee drift
    gsap.to(".marquee__track", {
      xPercent: -50, ease: "none",
      scrollTrigger: { trigger: ".marquee", start: "top bottom", end: "bottom top", scrub: 0.5 },
    });

    // hero meta bar pin-fade on scroll away
    gsap.to(".hero__center", {
      opacity: 0.15, y: -60, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 35%", scrub: 0.4 },
    });
  }

  /* ---------- Header hide on scroll down / show on scroll up ---------- */
  const header = document.getElementById("header");
  let lastY = 0;
  const onScrollHeader = (y) => {
    if (y > 140 && y > lastY + 4) header.classList.add("header--hidden");
    else if (y < lastY - 4 || y <= 140) header.classList.remove("header--hidden");
    lastY = y;
  };
  if (lenis) lenis.on("scroll", ({ scroll }) => onScrollHeader(scroll));
  else window.addEventListener("scroll", () => onScrollHeader(window.scrollY), { passive: true });

  /* ---------- Service accordions ---------- */
  document.querySelectorAll(".svc").forEach((svc) => {
    const head = svc.querySelector(".svc__head");
    head.addEventListener("click", () => {
      const isOpen = svc.classList.contains("svc--open");
      // close others (single-open behavior)
      document.querySelectorAll(".svc--open").forEach((other) => {
        if (other !== svc) {
          other.classList.remove("svc--open");
          other.querySelector(".svc__head").setAttribute("aria-expanded", "false");
        }
      });
      svc.classList.toggle("svc--open", !isOpen);
      head.setAttribute("aria-expanded", String(!isOpen));
      if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 650);
    });
  });

  /* ---------- Custom cursor (fine pointers) ---------- */
  if (window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
    const cursor = document.createElement("div");
    cursor.className = "cursor";
    document.body.appendChild(cursor);
    let cx = -100, cy = -100, tx = -100, ty = -100;
    window.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; cursor.classList.add("cursor--on"); }, { passive: true });
    const loop = () => {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      cursor.style.transform = "translate(" + (cx - 5) + "px," + (cy - 5) + "px)";
      requestAnimationFrame(loop);
    };
    loop();
    document.querySelectorAll("[data-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("cursor--grow"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("cursor--grow"));
    });
  }

  /* ---------- Scroll progress bar ---------- */
  const progress = document.getElementById("progress");
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const k = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progress) progress.style.transform = "scaleX(" + k + ")";
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* ---------- Price calculator ---------- */
  const calcPrice = document.getElementById("calcPrice");
  const calcOld = document.getElementById("calcOld");
  const calcFirst = document.getElementById("calcFirst");
  if (calcPrice && calcOld && calcFirst) {
    const fmt = (n) => Math.round(n).toLocaleString("ru-RU").replace(/\u00a0/g, " ");
    let shown = null, raf = 0;
    const render = (v) => { calcPrice.textContent = "от " + fmt(v) + " ₽"; };
    const update = () => {
      const sel = document.querySelector('input[name="svc"]:checked');
      if (!sel) return;
      const base = Number(sel.value);
      const first = calcFirst.checked;
      const target = first ? base * 0.8 : base;
      calcOld.textContent = first ? "вместо " + fmt(base) + " ₽" : "";
      cancelAnimationFrame(raf);
      if (reduceMotion || shown === null) { shown = target; render(target); return; }
      const from = shown, t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / 450);
        shown = from + (target - from) * (1 - Math.pow(1 - k, 3));
        render(shown);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    document.querySelectorAll('input[name="svc"]').forEach((r) => r.addEventListener("change", update));
    calcFirst.addEventListener("change", update);
    update();
  }

  /* ---------- Portfolio cards (из src/portfolio.js) ---------- */
  const SAFE_IMG = /^assets\/[\w\-./]+\.(jpe?g|png|webp|avif|gif)$/i;
  const SAFE_URL = /^(https:\/\/[^\s"'<>]+|demo\/[\w\-./]+\.html)$/i;
  document.querySelectorAll("[data-portfolio]").forEach((box) => {
    const list = ((window.PORTFOLIO || {})[box.dataset.portfolio]) || [];
    const label = document.createElement("p");
    label.className = "portfolio__label mono";
    label.textContent = "Примеры работ";
    box.appendChild(label);
    const items = list.filter((w) => w && typeof w.img === "string" && SAFE_IMG.test(w.img) && !w.img.includes(".."));
    if (!items.length) {
      const e = document.createElement("a");
      e.className = "work work--empty";
      e.href = "https://t.me/St1pa4"; e.target = "_blank"; e.rel = "noopener noreferrer";
      const b = document.createElement("b"); b.textContent = "Скоро добавлю сюда";
      e.appendChild(b);
      e.appendChild(document.createTextNode("Свежие примеры покажу в Telegram — напиши, пришлю подборку."));
      box.appendChild(e);
      return;
    }
    items.forEach((w) => {
      const link = typeof w.url === "string" && SAFE_URL.test(w.url);
      const card = document.createElement(link ? "a" : "div");
      card.className = "work";
      if (link) { card.href = w.url; card.target = "_blank"; card.rel = "noopener noreferrer"; card.setAttribute("data-cursor", ""); }
      const img = document.createElement("img");
      img.src = w.img; img.alt = String(w.title || "Пример работы"); img.loading = "lazy"; img.decoding = "async";
      const cap = document.createElement("span"); cap.className = "work__cap";
      const t = document.createElement("span"); t.className = "work__title"; t.textContent = String(w.title || "");
      cap.appendChild(t);
      if (w.text) { const d = document.createElement("span"); d.className = "work__text"; d.textContent = String(w.text); cap.appendChild(d); }
      card.appendChild(img); card.appendChild(cap);
      box.appendChild(card);
      if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
        card.addEventListener("mousemove", (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = "perspective(700px) rotateX(" + (-y * 6) + "deg) rotateY(" + (x * 6) + "deg)";
        });
        card.addEventListener("mouseleave", () => { card.style.transform = ""; });
      }
    });
  });

  /* ---------- 3D-фон: вращающийся торический узел (canvas, без библиотек) ---------- */
  const ambient = document.querySelector(".ambient");
  if (ambient) {
    const cv = document.createElement("canvas");
    cv.className = "ambient__3d";
    ambient.appendChild(cv);
    const ctx = cv.getContext("2d");
    const N = 160, M = 10, R = 0.42;
    const C = (u) => { const k = 2 + Math.cos(3 * u); return [k * Math.cos(2 * u), k * Math.sin(2 * u), Math.sin(3 * u) * 1.4]; };
    const V = [];
    for (let i = 0; i < N; i++) {
      const u = (i / N) * Math.PI * 2, e = 0.001;
      const a = C(u), b = C(u + e);
      let t = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const tl = Math.hypot(t[0], t[1], t[2]); t = t.map((x) => x / tl);
      let n = [t[1], -t[0], 0]; if (Math.hypot(n[0], n[1]) < 1e-4) n = [0, t[2], -t[1]];
      const nl = Math.hypot(n[0], n[1], n[2]); n = n.map((x) => x / nl);
      const bb = [t[1] * n[2] - t[2] * n[1], t[2] * n[0] - t[0] * n[2], t[0] * n[1] - t[1] * n[0]];
      const ring = [];
      for (let j = 0; j < M; j++) {
        const v = (j / M) * Math.PI * 2, cs = Math.cos(v) * R, sn = Math.sin(v) * R;
        ring.push([a[0] + cs * n[0] + sn * bb[0], a[1] + cs * n[1] + sn * bb[1], a[2] + cs * n[2] + sn * bb[2]]);
      }
      V.push(ring);
    }
    let W = 0, H = 0, dpr = 1, mx = 0, my = 0, smx = 0, smy = 0;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    };
    resize(); window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; }, { passive: true });
    const BUCKETS = 4;
    const draw = (time) => {
      smx += (mx - smx) * 0.04; smy += (my - smy) * 0.04;
      const sy = window.scrollY || 0;
      const ay = time * 0.00012 + smx * 0.9 + sy * 0.0004;
      const ax = 0.6 + smy * 0.6 + sy * 0.0003;
      const cy = Math.cos(ay), sY = Math.sin(ay), cx = Math.cos(ax), sX = Math.sin(ax);
      const mobile = W < 700;
      const scale = Math.min(W, H) * (mobile ? 0.12 : 0.105);
      const ox = W * (mobile ? 0.5 : 0.74), oy = H * (mobile ? 0.3 : 0.5);
      const P = new Array(N);
      for (let i = 0; i < N; i++) {
        const row = new Array(M);
        for (let j = 0; j < M; j++) {
          let [x, y, z] = V[i][j];
          let x1 = x * cy + z * sY, z1 = -x * sY + z * cy;
          let y1 = y * cx - z1 * sX, z2 = y * sX + z1 * cx;
          const f = 9 / (9 + z2);
          row[j] = [ox + x1 * scale * f, oy + y1 * scale * f, z2];
        }
        P[i] = row;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      const paths = [];
      for (let b = 0; b < BUCKETS; b++) paths.push(new Path2D());
      const bucket = (z) => Math.max(0, Math.min(BUCKETS - 1, Math.floor(((z + 3.2) / 6.4) * BUCKETS)));
      for (let i = 0; i < N; i++) {
        const i2 = (i + 1) % N;
        for (let j = 0; j < M; j++) {
          const a = P[i][j], c = P[i2][j];
          const p = paths[bucket((a[2] + c[2]) / 2)];
          p.moveTo(a[0], a[1]); p.lineTo(c[0], c[1]);
        }
        if (i % 4 === 0) {
          for (let j = 0; j < M; j++) {
            const a = P[i][j], c = P[i][(j + 1) % M];
            const p = paths[bucket((a[2] + c[2]) / 2)];
            p.moveTo(a[0], a[1]); p.lineTo(c[0], c[1]);
          }
        }
      }
      // дальше (z больше) — тусклее, ближе — ярче
      for (let b = BUCKETS - 1; b >= 0; b--) {
        const k = (BUCKETS - b) / BUCKETS;
        ctx.strokeStyle = "rgba(183,171,152," + (0.05 + 0.22 * k * k).toFixed(3) + ")";
        ctx.stroke(paths[b]);
      }
    };
    if (reduceMotion) { draw(3000); window.addEventListener("resize", () => draw(3000)); }
    else {
      const loop = (t) => { if (!document.hidden) draw(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
  }

  /* ---------- Магнитные кнопки (двигается только подпись) ---------- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".pill-btn").forEach((btn) => {
      const label = btn.querySelector(".pill-btn__label");
      if (!label) return;
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / r.width, y = (e.clientY - (r.top + r.height / 2)) / r.height;
        label.style.transform = "translate(" + (x * 12) + "px," + (y * 8) + "px)";
      });
      btn.addEventListener("mouseleave", () => { label.style.transform = ""; });
    });
  }

  /* ---------- Часы Калуги в подвале ---------- */
  const clock = document.getElementById("clock");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow" });
    const tick = () => { clock.textContent = "Калуга · " + fmt.format(new Date()); };
    tick(); setInterval(tick, 20000);
  }

  /* ---------- Пасхалка: 5 кликов по логотипу ---------- */
  const logo = document.querySelector(".header__logo");
  if (logo && !reduceMotion) {
    let clicks = 0, timer = 0;
    logo.addEventListener("click", () => {
      clicks++; clearTimeout(timer);
      timer = setTimeout(() => { clicks = 0; }, 2000);
      if (clicks < 5) return;
      clicks = 0;
      const words = ["St1pa4", "✦", "html", "css", "js", "<3", "+", "·"];
      const r = logo.getBoundingClientRect();
      for (let i = 0; i < 28; i++) {
        const s = document.createElement("span");
        s.className = "spark"; s.textContent = words[i % words.length];
        s.style.left = (r.left + r.width / 2) + "px"; s.style.top = (r.top + r.height / 2) + "px";
        document.body.appendChild(s);
        const ang = Math.random() * Math.PI * 2, d = 90 + Math.random() * 260;
        s.animate([
          { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
          { transform: "translate(" + Math.cos(ang) * d + "px," + (Math.sin(ang) * d + 120) + "px) rotate(" + (Math.random() * 360 - 180) + "deg)", opacity: 0 }
        ], { duration: 1100 + Math.random() * 700, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => s.remove();
      }
    });
  }
})();
