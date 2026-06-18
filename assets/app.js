(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', mobilePanel.classList.contains('is-open'));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    var showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    restart();
  }

  var filterScope = document.querySelector('[data-filter-scope]');

  if (filterScope) {
    var filterInput = filterScope.querySelector('[data-filter-input]');
    var chips = Array.prototype.slice.call(filterScope.querySelectorAll('[data-filter-year]'));
    var cards = Array.prototype.slice.call(filterScope.querySelectorAll('[data-movie-card]'));
    var empty = filterScope.querySelector('[data-empty-state]');
    var activeYear = 'all';

    var applyFilter = function () {
      var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-text') || '').toLowerCase();
        var year = card.getAttribute('data-year') || '';
        var matchedYear = activeYear === 'all' || year === activeYear;
        var matchedText = !query || text.indexOf(query) !== -1;
        var show = matchedYear && matchedText;

        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeYear = chip.getAttribute('data-filter-year') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        applyFilter();
      });
    });
  }

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var startButton = player.querySelector('.player-poster');
    var configTag = document.getElementById('video-config');
    var config = {};
    var hls = null;
    var attached = false;

    try {
      config = JSON.parse(configTag ? configTag.textContent : '{}');
    } catch (error) {
      config = {};
    }

    var attachVideo = function () {
      if (!video || !config.url || attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(config.url);
        hls.attachMedia(video);
      } else {
        video.src = config.url;
      }
    };

    var startVideo = function () {
      attachVideo();
      player.classList.add('is-playing');

      if (video) {
        var promise = video.play();

        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
    };

    if (startButton) {
      startButton.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!attached) {
          startVideo();
        }
      });
    }
  }

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage && window.MOVIE_SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var input = searchPage.querySelector('[data-search-input]');
    var results = searchPage.querySelector('[data-search-results]');
    var status = searchPage.querySelector('[data-search-status]');
    var buttons = Array.prototype.slice.call(searchPage.querySelectorAll('[data-search-tag]'));
    var query = params.get('q') || '';

    var normalize = function (value) {
      return String(value || '').toLowerCase();
    };

    var createCard = function (item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + tag + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '<a class="movie-card-link" href="' + item.href + '">',
        '<div class="poster-wrap">',
        '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">',
        '<span class="poster-badge">' + item.year + '</span>',
        '</div>',
        '<div class="movie-card-body">',
        '<div class="movie-meta-row"><span>' + item.category + '</span><span>' + item.region + '</span></div>',
        '<h2>' + item.title + '</h2>',
        '<p>' + item.oneLine + '</p>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</a>',
        '</article>'
      ].join('');
    };

    var render = function (value) {
      var keyword = normalize(value.trim());

      if (input) {
        input.value = value;
      }

      if (!keyword) {
        results.innerHTML = '';
        status.textContent = '输入关键词后显示匹配内容';
        return;
      }

      var matched = window.MOVIE_SEARCH_DATA.filter(function (item) {
        return normalize(item.title + ' ' + item.oneLine + ' ' + item.region + ' ' + item.genre + ' ' + item.year + ' ' + (item.tags || []).join(' ')).indexOf(keyword) !== -1;
      }).slice(0, 120);

      results.innerHTML = matched.map(createCard).join('');
      status.textContent = matched.length ? '搜索结果' : '没有匹配的影视内容';
    };

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = (button.getAttribute('data-search-tag') || '').replace(/^#/, '');
        render(value);
        history.replaceState(null, '', 'search.html?q=' + encodeURIComponent(value));
      });
    });

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    render(query);
  }
})();
