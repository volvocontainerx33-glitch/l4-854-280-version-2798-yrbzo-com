(function () {
  var siteScript = document.currentScript;
  var vendorUrl = siteScript ? new URL('hls-vendor.js', siteScript.src).toString() : 'assets/js/hls-vendor.js';

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileNav() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var activeIndex = 0;
    var timer = null;

    function showSlide(nextIndex) {
      activeIndex = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === activeIndex);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === activeIndex);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startAutoPlay();
      });
    });

    hero.addEventListener('mouseenter', stopAutoPlay);
    hero.addEventListener('mouseleave', startAutoPlay);
    startAutoPlay();
  }

  function setupLocalFilters() {
    var inputs = selectAll('[data-filter-input]');
    inputs.forEach(function (input) {
      var section = input.closest('main') || document;
      var scope = section.querySelector('[data-filter-scope]');
      var empty = section.querySelector('[data-empty-state]');
      if (!scope) {
        return;
      }
      var cards = selectAll('[data-search]', scope);
      input.addEventListener('input', function () {
        var keyword = input.value.trim().toLowerCase();
        var visibleCount = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var isVisible = !keyword || text.indexOf(keyword) !== -1;
          card.hidden = !isVisible;
          if (isVisible) {
            visibleCount += 1;
          }
        });
        if (empty) {
          empty.hidden = visibleCount !== 0;
        }
      });
    });
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return (params.get(name) || '').trim();
  }

  function buildSearchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card" data-search="' + escapeHtml(item.searchText) + '">' +
      '<a class="movie-cover" href="' + item.file + '" style="background-image: linear-gradient(180deg, rgba(15, 23, 42, 0.05), rgba(2, 6, 23, 0.78)), url(' + item.cover + ');" aria-label="' + escapeHtml(item.title) + '">' +
        '<span class="movie-badge">' + escapeHtml(item.category) + '</span>' +
        '<span class="cover-play">▶</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
        '<h3><a href="' + item.file + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p class="movie-meta">' + escapeHtml(item.region + ' · ' + item.year + ' · ' + item.type) + '</p>' +
        '<p class="movie-desc">' + escapeHtml(item.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
    '</article>';
  }

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

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    var input = document.querySelector('[data-search-page-input]');
    if (!results || !summary || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var keyword = getQueryValue('q');
    if (input) {
      input.value = keyword;
    }
    if (!keyword) {
      return;
    }
    var lowerKeyword = keyword.toLowerCase();
    var matched = window.MOVIE_SEARCH_INDEX.filter(function (item) {
      return (item.searchText || '').toLowerCase().indexOf(lowerKeyword) !== -1;
    }).slice(0, 120);
    summary.textContent = matched.length ? '搜索结果：' + keyword : '未找到匹配内容：' + keyword;
    results.innerHTML = matched.map(buildSearchCard).join('');
  }

  function setupPlayers() {
    selectAll('.player-shell').forEach(function (shell) {
      var video = shell.querySelector('.js-video-player');
      var button = shell.querySelector('.player-play-button');
      var hlsSource = shell.getAttribute('data-hls-src');
      var mp4Source = shell.getAttribute('data-mp4-src');
      var attached = false;
      var hlsInstance = null;

      if (!video || !button) {
        return;
      }

      function attachNativeHls() {
        if (hlsSource && video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = hlsSource;
          return true;
        }
        return false;
      }

      function attachMp4Fallback() {
        if (mp4Source) {
          video.src = mp4Source;
          return true;
        }
        return false;
      }

      function attachHls() {
        if (attached) {
          return Promise.resolve();
        }
        attached = true;
        if (attachNativeHls()) {
          return Promise.resolve();
        }
        if (!hlsSource || window.location.protocol === 'file:') {
          attachMp4Fallback();
          return Promise.resolve();
        }
        return import(vendorUrl).then(function (module) {
          var Hls = module.H;
          if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
              enableWorker: true,
              lowLatencyMode: false,
              backBufferLength: 90
            });
            hlsInstance.loadSource(hlsSource);
            hlsInstance.attachMedia(video);
            shell.hlsInstance = hlsInstance;
          } else {
            attachMp4Fallback();
          }
        }).catch(function () {
          attachMp4Fallback();
        });
      }

      function playVideo() {
        attachHls().then(function () {
          shell.classList.add('is-playing');
          var playRequest = video.play();
          if (playRequest && typeof playRequest.catch === 'function') {
            playRequest.catch(function () {
              shell.classList.remove('is-playing');
            });
          }
        });
      }

      button.addEventListener('click', playVideo);
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
        if (hlsInstance && typeof hlsInstance.stopLoad === 'function') {
          hlsInstance.stopLoad();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
