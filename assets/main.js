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

  /* ---------- Hero fan: pointer + scroll parallax ---------- */
  var fan = document.querySelector(".fan");
  var hero = document.querySelector(".hero");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (fan && hero && !reduce) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function tick() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      fan.style.setProperty("--fan-x", cx.toFixed(2) + "px");
      fan.style.setProperty("--fan-y", cy.toFixed(2) + "px");
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
        raf = requestAnimationFrame(tick);
      } else { raf = null; }
    }
    function nudge() { if (!raf) raf = requestAnimationFrame(tick); }

    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 46;   // ±23px
      ty = ((e.clientY - r.top) / r.height - 0.5) * 30;   // ±15px
      nudge();
    });
    hero.addEventListener("pointerleave", function () { tx = 0; ty = 0; nudge(); });
    window.addEventListener("scroll", function () {
      // gentle drift as the hero scrolls away
      if (window.scrollY < window.innerHeight) { ty = window.scrollY * 0.04; nudge(); }
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
