(function () {
  function setupMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var input = form.querySelector("[data-filter-input]");
      var category = form.querySelector("[data-filter-category]");
      var region = form.querySelector("[data-filter-region]");
      var scope = form.closest("[data-filter-scope]") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

      function norm(value) {
        return String(value || "").toLowerCase().trim();
      }

      function apply() {
        var q = norm(input && input.value);
        var c = norm(category && category.value);
        var r = norm(region && region.value);
        cards.forEach(function (card) {
          var content = [
            card.getAttribute("data-title"),
            card.getAttribute("data-category"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.textContent
          ].join(" ").toLowerCase();
          var cardCategory = norm(card.getAttribute("data-category"));
          var cardRegion = norm(card.getAttribute("data-region"));
          var matched = true;
          if (q && content.indexOf(q) === -1) {
            matched = false;
          }
          if (c && cardCategory !== c) {
            matched = false;
          }
          if (r && cardRegion.indexOf(r) === -1) {
            matched = false;
          }
          card.classList.toggle("is-filter-hidden", !matched);
        });
      }

      [input, category, region].forEach(function (field) {
        if (field) {
          field.addEventListener("input", apply);
          field.addEventListener("change", apply);
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileNav();
    setupHero();
    setupFilters();
  });
})();
