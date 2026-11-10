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
})();
