(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    document.querySelectorAll('[data-menu-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        var panel = document.querySelector('[data-mobile-panel]');
        if (panel) {
          panel.classList.toggle('is-open');
        }
      });
    });

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        if (value) {
          window.location.href = './search.html?q=' + encodeURIComponent(value);
        }
      });
    });

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer = null;
      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === current);
        });
      }
      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5600);
      }
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          restart();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          restart();
        });
      });
      show(0);
      restart();
    });

    document.querySelectorAll('[data-filter-input]').forEach(function (input) {
      var list = document.querySelector('[data-filter-list]');
      var empty = document.querySelector('[data-empty-state]');
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-year') || ''
          ].join(' ').toLowerCase();
          var match = !query || haystack.indexOf(query) !== -1;
          card.style.display = match ? '' : 'none';
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      });
    });

    var searchInput = document.getElementById('search-input');
    var searchResults = document.querySelector('[data-search-results]');
    if (searchInput && searchResults && window.SEARCH_INDEX) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';
      var summary = document.querySelector('[data-search-summary]');
      var empty = document.querySelector('[data-empty-state]');
      searchInput.value = initial;
      function card(item) {
        return '<article class="movie-card">' +
          '<a class="poster-link" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="poster-mask"><span class="play-dot">▶</span></span>' +
          '</a>' +
          '<div class="movie-info">' +
          '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<p>' + escapeHtml(item.desc) + '</p>' +
          '<div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
          '</div>' +
          '</article>';
      }
      function render() {
        var q = searchInput.value.trim().toLowerCase();
        var items = window.SEARCH_INDEX.filter(function (item) {
          if (!q) {
            return true;
          }
          return item.text.toLowerCase().indexOf(q) !== -1;
        }).slice(0, 120);
        searchResults.innerHTML = items.map(card).join('');
        if (summary) {
          summary.textContent = q ? '搜索结果：' + searchInput.value.trim() : '热门片单';
        }
        if (empty) {
          empty.classList.toggle('is-visible', items.length === 0);
        }
      }
      searchInput.addEventListener('input', render);
      render();
    }
  });

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }
}());
