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

  var grid = document.getElementById("team-grid");
  if (grid && Array.isArray(window.DK_PEOPLE)) {
    window.DK_PEOPLE.forEach(function (p) { grid.appendChild(renderPerson(p)); });
  }

  /* ---------- Hero: Denmark land-use mosaic ---------- */
  var heroArt = document.querySelector(".hero-art");
  var grid = document.querySelector(".denmark-grid");
  var hero = document.querySelector(".hero");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (grid) {
    var SVGNS = "http://www.w3.org/2000/svg";
    var STEP = 5, SIZE = 4.3, N = 40;
    // landscape tones, ordered so neighbours are perceptually close
    var TONES = ["#1d4736", "#2f6b50", "#4a7d54", "#6e9a90", "#3f7e96", "#c9bfa6"];

    function baseTone(gx, gy) {
      // smooth value-noise -> organic land-use patches
      var v = Math.sin(gx * 0.45 + 0.3) + Math.sin(gy * 0.5 - 0.7)
            + Math.sin((gx + gy) * 0.22) + Math.sin((gx - gy) * 0.35);
      v = (v + 4) / 8 + (Math.random() - 0.5) * 0.12;
      return Math.min(TONES.length - 1, Math.max(0, Math.floor(v * TONES.length)));
    }

    var cells = [];
    for (var gy = 0; gy < N; gy++) {
      for (var gx = 0; gx < N; gx++) {
        var rect = document.createElementNS(SVGNS, "rect");
        var off = (STEP - SIZE) / 2;
        rect.setAttribute("x", (gx * STEP + off).toFixed(2));
        rect.setAttribute("y", (gy * STEP + off).toFixed(2));
        rect.setAttribute("width", SIZE);
        rect.setAttribute("height", SIZE);
        rect.setAttribute("rx", "0.6");
        var bi = baseTone(gx, gy);
        rect.setAttribute("fill", TONES[bi]);
        rect.dataset.base = bi;
        grid.appendChild(rect);
        cells.push(rect);
      }
    }

    // Reclassify a few cells around their base tone: land use shifting,
    // a visual stand-in for prediction under uncertainty.
    if (!reduce) {
      setInterval(function () {
        for (var k = 0; k < 6; k++) {
          var c = cells[(Math.random() * cells.length) | 0];
          var base = +c.dataset.base;
          var idx = Math.max(0, Math.min(TONES.length - 1, base + ((Math.random() * 3) | 0) - 1));
          c.setAttribute("fill", TONES[idx]);
        }
      }, 620);
    }
  }

  /* ---------- Hero: pointer + scroll parallax ---------- */
  if (heroArt && hero && !reduce) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function tick() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      heroArt.style.setProperty("--dk-x", cx.toFixed(2) + "px");
      heroArt.style.setProperty("--dk-y", cy.toFixed(2) + "px");
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
        raf = requestAnimationFrame(tick);
      } else { raf = null; }
    }
    function nudge() { if (!raf) raf = requestAnimationFrame(tick); }

    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 34;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 24;
      nudge();
    });
    hero.addEventListener("pointerleave", function () { tx = 0; ty = 0; nudge(); });
    window.addEventListener("scroll", function () {
      if (window.scrollY < window.innerHeight) { ty = window.scrollY * 0.03; nudge(); }
    }, { passive: true });
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
