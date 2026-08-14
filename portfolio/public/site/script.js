/* Portfolio Ayoub Boumaaza — interacties (plain JavaScript) */
(function () {
  "use strict";

  /* Mobiel menu -------------------------------------------------------- */
  function initNav() {
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("navMenu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    menu.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Projectfilter ------------------------------------------------------ */
  function initFilters() {
    var chips = document.querySelectorAll(".chip");
    var projects = document.querySelectorAll(".project");
    var empty = document.getElementById("emptyState");
    if (!chips.length) return;

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var filter = chip.dataset.filter;
        var visible = 0;

        chips.forEach(function (other) { other.classList.remove("is-active"); });
        chip.classList.add("is-active");

        projects.forEach(function (project) {
          var cats = project.dataset.cat.split(" ");
          var show = filter === "all" || cats.indexOf(filter) !== -1;
          project.classList.toggle("is-hidden", !show);
          if (show) visible++;
        });

        if (empty) empty.hidden = visible !== 0;
      });
    });
  }

  /* Scroll reveal ------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) { item.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    items.forEach(function (item) { observer.observe(item); });
  }

  /* Tellers in de hero ------------------------------------------------- */
  function initCounters() {
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseInt(el.dataset.count, 10) || 0;
      var current = 0;
      var step = Math.max(1, Math.round(target / 30));

      var timer = setInterval(function () {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = String(current);
      }, 40);
    });
  }

  /* Jaartal in de footer ----------------------------------------------- */
  function initYear() {
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initFilters();
    initReveal();
    initCounters();
    initYear();
  });
})();
