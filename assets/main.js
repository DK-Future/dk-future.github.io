/* ============================================================
   DK-Future — interactions
   - Renders the team grid from window.DK_PEOPLE
   - Reveal-on-scroll for elements with .reveal
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Team grid ---------- */
  function initials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (w) { return w[0]; })
      .join("")
      .toUpperCase();
  }

  var linkLabels = {
    profile: "Profile",
    scholar: "Scholar",
    email: "Email"
  };

  function renderPerson(p) {
    var el = document.createElement("article");
    el.className = "person";

    function makeInitials() {
      var d = document.createElement("div");
      d.className = "person-avatar";
      d.textContent = initials(p.name);
      d.setAttribute("aria-hidden", "true");
      return d;
    }

    var avatar;
    if (p.photo) {
      avatar = document.createElement("img");
      avatar.className = "person-avatar";
      avatar.src = p.photo;
      avatar.alt = p.name;
      avatar.loading = "lazy";
      // Fall back to initials if the photo file isn't there yet.
      avatar.onerror = function () { el.replaceChild(makeInitials(), avatar); };
    } else {
      avatar = makeInitials();
    }
    el.appendChild(avatar);

    var name = document.createElement("span");
    name.className = "person-name";
    name.textContent = p.name;
    el.appendChild(name);

    if (p.role) {
      var role = document.createElement("span");
      role.className = "person-role";
      role.textContent = p.role;
      el.appendChild(role);
    }

    if (p.affil) {
      var affil = document.createElement("span");
      affil.className = "person-affil";
      affil.textContent = p.affil;
      el.appendChild(affil);
    }

    if (p.links) {
      var wrap = document.createElement("div");
      wrap.className = "person-links";
      Object.keys(linkLabels).forEach(function (key) {
        var val = p.links[key];
        if (!val) return;
        var a = document.createElement("a");
        a.textContent = linkLabels[key];
        a.href = key === "email" ? "mailto:" + val : val;
        if (key !== "email") { a.target = "_blank"; a.rel = "noopener"; }
        wrap.appendChild(a);
      });
      if (wrap.childNodes.length) el.appendChild(wrap);
    }

    return el;
  }

  /* A grid shows everyone in people.js, unless it carries a data-people
     attribute — a "|"-separated list of names, rendered in that order.
     (Used by the workshop page to show just the organisers.) */
  function peopleFor(grid) {
    var all = window.DK_PEOPLE;
    var only = grid.getAttribute("data-people");
    if (!only) return all;
    return only.split("|").map(function (name) {
      var wanted = name.trim();
      for (var i = 0; i < all.length; i++) {
        if (all[i].name === wanted) return all[i];
      }
      return null;
    }).filter(Boolean);
  }

  if (Array.isArray(window.DK_PEOPLE)) {
    document.querySelectorAll(".team-grid").forEach(function (grid) {
      peopleFor(grid).forEach(function (p) { grid.appendChild(renderPerson(p)); });
    });
  }

  /* ---------- Hero: Denmark land-use mosaic (canvas) ----------
     Rendered on a <canvas> rather than ~1600 clipped SVG rects, which
     keeps Safari fast: parallax just moves one bitmap and cell changes
     are cheap redraws instead of re-rasterising a clipped SVG.        */
  var canvas = document.querySelector(".denmark-canvas");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var STEP = 5, SIZE = 4.3, N = 40, OFF = (STEP - SIZE) / 2;
    var TONES = [[29,71,54],[47,107,80],[74,125,84],[110,154,144],[63,126,150],[201,191,166]];

    function baseTone(gx, gy) {
      var v = Math.sin(gx * 0.45 + 0.3) + Math.sin(gy * 0.5 - 0.7)
            + Math.sin((gx + gy) * 0.22) + Math.sin((gx - gy) * 0.35);
      v = (v + 4) / 8 + (Math.random() - 0.5) * 0.12;
      return Math.min(TONES.length - 1, Math.max(0, Math.floor(v * TONES.length)));
    }

    // Denmark outline -> one Path2D in 0..200 space. The country only fills
    // part of that square, so we keep its bounding box (measured off the clip
    // path) and draw to that instead - the canvas box then bounds the coast
    // exactly, which is what the hero layout aligns against.
    var BBOX = { x: 19.68, y: 0.02, w: 160.77, h: 199.82 };
    var dkPath = new Path2D();
    var M = new DOMMatrix([0.01953125, 0, 0, -0.01953125, 0, 200]);
    document.querySelectorAll("#dkClip path").forEach(function (p) {
      dkPath.addPath(new Path2D(p.getAttribute("d")), M);
    });

    var cells = [];
    for (var gy = 0; gy < N; gy++) {
      for (var gx = 0; gx < N; gx++) {
        var bi = baseTone(gx, gy);
        cells.push({ x: gx * STEP + OFF, y: gy * STEP + OFF, base: bi,
                     cur: TONES[bi].slice(), tgt: TONES[bi] });
      }
    }

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      var r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      var w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (w !== canvas.width || h !== canvas.height) { canvas.width = w; canvas.height = h; }
      return true;
    }
    function draw() {
      var w = canvas.width, h = canvas.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      var s = Math.min(w / BBOX.w, h / BBOX.h);
      ctx.setTransform(s, 0, 0, s,
                       (w - BBOX.w * s) / 2 - BBOX.x * s,
                       (h - BBOX.h * s) / 2 - BBOX.y * s);
      ctx.save();
      ctx.clip(dkPath);
      for (var i = 0; i < cells.length; i++) {
        var c = cells[i];
        ctx.fillStyle = "rgb(" + (c.cur[0] | 0) + "," + (c.cur[1] | 0) + "," + (c.cur[2] | 0) + ")";
        ctx.fillRect(c.x, c.y, SIZE, SIZE);
      }
      ctx.restore();
    }

    var animating = false;
    function frame() {
      var active = false;
      for (var i = 0; i < cells.length; i++) {
        var c = cells[i], a = c.cur, t = c.tgt;
        var d0 = t[0] - a[0], d1 = t[1] - a[1], d2 = t[2] - a[2];
        if (Math.abs(d0) > 0.6 || Math.abs(d1) > 0.6 || Math.abs(d2) > 0.6) {
          a[0] += d0 * 0.09; a[1] += d1 * 0.09; a[2] += d2 * 0.09; active = true;
        } else { a[0] = t[0]; a[1] = t[1]; a[2] = t[2]; }
      }
      draw();
      if (active) requestAnimationFrame(frame); else animating = false;
    }
    function kick() { if (!animating) { animating = true; requestAnimationFrame(frame); } }

    if (resize()) draw();
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(function () { if (resize()) draw(); }).observe(canvas);
    } else {
      window.addEventListener("resize", function () { if (resize()) draw(); });
    }

    // Reclassify a few cells around their base tone: land use shifting.
    if (!reduce) {
      setInterval(function () {
        for (var k = 0; k < 6; k++) {
          var c = cells[(Math.random() * cells.length) | 0];
          var idx = Math.max(0, Math.min(TONES.length - 1, c.base + ((Math.random() * 3) | 0) - 1));
          c.tgt = TONES[idx];
        }
        kick();
      }, 700);
    }
  }

  /* ---------- Upcoming events carousel ----------
     Deliberately manual: arrows, dots, drag/swipe and keyboard, but no
     autoplay - it sits high on the page and should not steal attention.
     With a single event the controls stay hidden and it reads as a card. */
  var track = document.querySelector(".upcoming-track");
  if (track) {
    var slides = track.querySelectorAll(".upcoming-slide");
    var nav = document.querySelector(".upcoming-nav");
    var dotBox = document.querySelector(".upcoming-dots");

    if (slides.length > 1) {
      nav.hidden = false;
      dotBox.hidden = false;

      var dots = [];
      slides.forEach(function (slide, i) {
        var d = document.createElement("button");
        d.type = "button";
        d.className = "upcoming-dot";
        d.setAttribute("aria-label", "Event " + (i + 1) + " of " + slides.length);
        d.addEventListener("click", function () { goTo(i); });
        dotBox.appendChild(d);
        dots.push(d);
      });

      var buttons = nav.querySelectorAll(".upcoming-btn");

      function current() {
        // Slides are equal width, so position maps straight to an index.
        return Math.round(track.scrollLeft / (track.scrollWidth / slides.length));
      }

      /* Scripted with rAF rather than scrollTo({behavior:"smooth"}): a
         mandatory snap container cancels the native animation, and snapping
         also fights a scripted one, so we suspend it for the duration. */
      var restoreSnap = null;
      function animateTo(x) {
        if (reduce) { track.scrollLeft = x; return; }
        var from = track.scrollLeft, dist = x - from, started = null, DUR = 380;
        track.style.scrollSnapType = "none";
        clearTimeout(restoreSnap);
        requestAnimationFrame(function step(ts) {
          if (started === null) started = ts;
          var p = Math.min(1, (ts - started) / DUR);
          var eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          track.scrollLeft = from + dist * eased;
          if (p < 1) { requestAnimationFrame(step); return; }
          track.scrollLeft = x;
          restoreSnap = setTimeout(function () { track.style.scrollSnapType = ""; }, 60);
        });
      }

      function goTo(i) {
        var clamped = Math.max(0, Math.min(slides.length - 1, i));
        animateTo(slides[clamped].offsetLeft - slides[0].offsetLeft);
      }
      function sync() {
        var i = current();
        dots.forEach(function (d, n) { d.setAttribute("aria-current", n === i ? "true" : "false"); });
        buttons[0].disabled = i <= 0;
        buttons[1].disabled = i >= slides.length - 1;
      }

      buttons.forEach(function (b) {
        b.addEventListener("click", function () {
          goTo(current() + Number(b.dataset.dir));
        });
      });

      // Scroll fires in bursts; settle before reading the position back.
      var settle = null;
      track.addEventListener("scroll", function () {
        clearTimeout(settle);
        settle = setTimeout(sync, 80);
      }, { passive: true });

      track.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); goTo(current() + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); goTo(current() - 1); }
      });

      window.addEventListener("resize", sync);
      sync();
    }
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }
})();
