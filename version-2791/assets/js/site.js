(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = qs('.mobile-toggle');
    var menu = qs('.mobile-menu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = menu.hasAttribute('hidden');
      if (opened) {
        menu.removeAttribute('hidden');
        button.setAttribute('aria-expanded', 'true');
        button.textContent = '×';
      } else {
        menu.setAttribute('hidden', '');
        button.setAttribute('aria-expanded', 'false');
        button.textContent = '☰';
      }
    });
  }

  function setupHero() {
    var root = qs('.hero-carousel');
    if (!root) {
      return;
    }
    var slides = qsa('.hero-slide', root);
    var dots = qsa('.hero-dot', root);
    var prev = qs('.hero-prev', root);
    var next = qs('.hero-next', root);
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    show(0);
    play();
  }

  function setupFilters() {
    var panel = qs('.filter-panel');
    var list = qs('.filter-list');
    if (!panel || !list) {
      return;
    }
    var searchInput = qs('.local-search', panel);
    var regionFilter = qs('.region-filter', panel);
    var genreFilter = qs('.genre-filter', panel);
    var yearFilter = qs('.year-filter', panel);
    var reset = qs('.filter-reset', panel);
    var empty = qs('.empty-result');
    var cards = qsa('.movie-card', list);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && searchInput) {
      searchInput.value = q;
    }

    function match(card) {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var region = normalize(regionFilter ? regionFilter.value : '');
      var genre = normalize(genreFilter ? genreFilter.value : '');
      var year = normalize(yearFilter ? yearFilter.value : '');
      var text = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.year
      ].join(' '));
      if (keyword && text.indexOf(keyword) === -1) {
        return false;
      }
      if (region && normalize(card.dataset.region) !== region) {
        return false;
      }
      if (genre && normalize(card.dataset.genre).indexOf(genre) === -1) {
        return false;
      }
      if (year && normalize(card.dataset.year) !== year) {
        return false;
      }
      return true;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = match(card);
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [searchInput, regionFilter, genreFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        [searchInput, regionFilter, genreFilter, yearFilter].forEach(function (control) {
          if (control) {
            control.value = '';
          }
        });
        apply();
      });
    }

    apply();
  }

  function setupImages() {
    qsa('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-hidden');
      });
    });
  }

  function initializePlayer(id, streamUrl) {
    var video = document.getElementById(id);
    if (!video || !streamUrl) {
      return;
    }
    var shell = video.closest('.player-shell');
    var trigger = shell ? qs('.play-trigger', shell) : null;
    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = streamUrl;
    }

    function start() {
      attach();
      var playAction = video.play();
      if (playAction && typeof playAction.catch === 'function') {
        playAction.catch(function () {
          if (trigger) {
            trigger.style.opacity = '1';
            trigger.style.pointerEvents = 'auto';
          }
        });
      }
    }

    function setPlaying(isPlaying) {
      if (shell) {
        shell.classList.toggle('is-playing', isPlaying);
      }
    }

    if (trigger) {
      trigger.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      setPlaying(true);
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        setPlaying(false);
      }
    });

    video.addEventListener('ended', function () {
      setPlaying(false);
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });

    attach();
  }

  window.MovieSite = {
    player: initializePlayer
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupImages();
  });
})();
