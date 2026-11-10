(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stage = document.getElementById("stage");
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var count = document.getElementById("count");
  var bar = document.getElementById("bar");
  var overview = document.getElementById("overview");
  var ovList = document.getElementById("ovList");
  var hint = document.getElementById("hint");
  var fxBtn = document.getElementById("fxBtn");
  var cur = -1;

  /* ---------- масштаб сцены ---------- */
  function fit() {
    var k = Math.min(window.innerWidth / 1280, (window.innerHeight - 56) / 720);
    stage.style.transform = "translate(-50%,-50%) scale(" + k + ")";
  }

  /* ---------- эффекты перехода ---------- */
  var FX = ["slide", "zoom", "wipe", "flip"];
  var NAMES = { auto: "авто", slide: "сдвиг", zoom: "зум", wipe: "шторка", flip: "3D" };
  var MODES = ["auto", "slide", "zoom", "wipe", "flip"];
  var mode = 0, fxTick = 0;
  fxBtn.addEventListener("click", function () {
    mode = (mode + 1) % MODES.length;
    fxBtn.textContent = "Переход: " + NAMES[MODES[mode]];
  });

  /* ---------- переход ---------- */
  function go(n, silent) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === cur) return;
    var prev = cur;
    stage.setAttribute("data-dir", n >= cur ? "next" : "prev");
    var m = MODES[mode];
    stage.setAttribute("data-fx", m === "auto" ? FX[fxTick++ % FX.length] : m);
    slides.forEach(function (s, i) {
      if (i === n) { s.classList.remove("is-leaving"); s.classList.add("is-active"); }
      else if (i === prev && !silent && !reduce) {
        s.classList.remove("is-active"); s.classList.add("is-leaving");
        (function (el) { setTimeout(function () { el.classList.remove("is-leaving"); }, 1000); })(s);
      } else { s.classList.remove("is-active"); s.classList.remove("is-leaving"); }
    });
    cur = n;
    count.textContent = (cur + 1) + " / " + slides.length;
    bar.style.width = ((cur + 1) / slides.length * 100) + "%";
    Array.prototype.forEach.call(ovList.children, function (b, i) { b.classList.toggle("is-on", i === cur); });
    galleryState();
    if (!silent) { try { history.replaceState(null, "", "#" + (cur + 1)); } catch (e) {} hint.classList.add("is-off"); }
  }

  /* ---------- обзор слайдов ---------- */
  slides.forEach(function (s, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "ov";
    var num = document.createElement("span"); num.textContent = String(i + 1).padStart(2, "0");
    b.appendChild(num); b.appendChild(document.createTextNode(s.dataset.title || "Слайд " + (i + 1)));
    b.addEventListener("click", function () { toggleOv(false); go(i); });
    ovList.appendChild(b);
  });
  function toggleOv(force) { overview.hidden = !(typeof force === "boolean" ? force : overview.hidden); }
  function fullscreen() {
    var d = document;
    if (d.fullscreenElement) d.exitFullscreen();
    else if (d.documentElement.requestFullscreen) d.documentElement.requestFullscreen().catch(function () {});
  }

  /* ---------- карусель артефактов ---------- */
  var gItems = Array.prototype.slice.call(document.querySelectorAll(".g-item"));
  var gDots = document.getElementById("gDots");
  var gi = 0, gTimer = 0;
  gItems.forEach(function (_, i) {
    var d = document.createElement("i");
    d.addEventListener("click", function (e) { e.stopPropagation(); gShow(i); gRestart(); });
    gDots.appendChild(d);
  });
  function gShow(i) {
    var next = (i + gItems.length) % gItems.length;
    gItems.forEach(function (it, k) {
      it.classList.toggle("is-on", k === next);
      it.classList.toggle("is-out", k !== next && k < next);
    });
    Array.prototype.forEach.call(gDots.children, function (d, k) { d.classList.toggle("is-on", k === next); });
    gi = next;
  }
  function gRestart() { clearInterval(gTimer); if (!reduce) gTimer = setInterval(function () { gShow(gi + 1); }, 4200); }
  function galleryState() {
    var active = slides[cur] && slides[cur].querySelector("#gallery");
    clearInterval(gTimer);
    if (active) { gShow(0); gRestart(); }
  }
  document.getElementById("gPrev").addEventListener("click", function (e) { e.stopPropagation(); gShow(gi - 1); gRestart(); });
  document.getElementById("gNext").addEventListener("click", function (e) { e.stopPropagation(); gShow(gi + 1); gRestart(); });
  gShow(0);

  /* ---------- управление ---------- */
  document.getElementById("prev").addEventListener("click", function () { go(cur - 1); });
  document.getElementById("next").addEventListener("click", function () { go(cur + 1); });
  document.getElementById("grid").addEventListener("click", function () { toggleOv(); });
  document.getElementById("full").addEventListener("click", fullscreen);
  overview.addEventListener("click", function (e) { if (e.target === overview) toggleOv(false); });

  window.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight" || k === "PageDown" || k === " " || k === "Enter") { e.preventDefault(); if (overview.hidden) go(cur + 1); }
    else if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); if (overview.hidden) go(cur - 1); }
    else if (k === "Home") go(0);
    else if (k === "End") go(slides.length - 1);
    else if (k === "g" || k === "G" || k === "п" || k === "П") toggleOv();
    else if (k === "f" || k === "F" || k === "а" || k === "А") fullscreen();
    else if (k === "Escape") toggleOv(false);
  });

  var sx = null, sy = null;
  stage.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1));
    sx = sy = null;
  }, { passive: true });
  stage.addEventListener("click", function (e) {
    if (e.target.closest("button,a")) return;
    var r = stage.getBoundingClientRect();
    go(cur + (e.clientX - r.left < r.width * 0.3 ? -1 : 1));
  });

  /* ---------- параллакс от мыши ---------- */
  if (!reduce) {
    window.addEventListener("mousemove", function (e) {
      stage.style.setProperty("--mx", ((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
      stage.style.setProperty("--my", ((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
    }, { passive: true });
  }

  /* ---------- искры и снег на фоне ---------- */
  var cv = document.getElementById("fx"), ctx = cv.getContext("2d");
  var P = [];
  function spawn(init) {
    var ember = Math.random() < 0.65;
    return {
      x: Math.random() * 1920, y: init ? Math.random() * 1080 : 1100 + Math.random() * 80,
      r: ember ? 1.2 + Math.random() * 2.6 : 1 + Math.random() * 2,
      vy: ember ? 0.4 + Math.random() * 1.1 : 0.2 + Math.random() * 0.5,
      sw: Math.random() * Math.PI * 2, sp: 0.01 + Math.random() * 0.02,
      ember: ember, a: 0.25 + Math.random() * 0.55
    };
  }
  for (var i = 0; i < 70; i++) P.push(spawn(true));
  function frame() {
    if (!document.hidden) {
      ctx.clearRect(0, 0, 1920, 1080);
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        p.y -= p.vy; p.sw += p.sp; p.x += Math.sin(p.sw) * 0.6;
        if (p.y < -20) P[i] = spawn(false);
        ctx.beginPath();
        ctx.fillStyle = p.ember ? "rgba(255,138,60," + p.a + ")" : "rgba(190,225,240," + (p.a * 0.7) + ")";
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  }
  if (!reduce) requestAnimationFrame(frame);

  window.addEventListener("resize", fit);
  fit();
  var start = parseInt(location.hash.slice(1), 10);
  go(isNaN(start) ? 0 : start - 1, true);
  setTimeout(function () { hint.classList.add("is-off"); }, 5000);
})();
