(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-current-year]').forEach(function (node) {
        node.textContent = new Date().getFullYear();
    });

    document.querySelectorAll('img[data-fallback-title]').forEach(function (image) {
        image.addEventListener('error', function () {
            var title = image.getAttribute('data-fallback-title') || '精选影片';
            var fallback = document.createElement('span');
            fallback.className = 'image-fallback';
            fallback.textContent = title;
            image.replaceWith(fallback);
        }, { once: true });
    });

    function setupHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

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
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupFilters() {
        document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
            var scope = panel.parentElement ? panel.parentElement.querySelector('[data-filter-scope]') : null;
            if (!scope) {
                scope = document.querySelector('[data-filter-scope]');
            }
            if (!scope) {
                return;
            }

            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
            var searchInput = panel.querySelector('[data-filter-search]');
            var yearSelect = panel.querySelector('[data-filter-year]');
            var regionSelect = panel.querySelector('[data-filter-region]');
            var typeSelect = panel.querySelector('[data-filter-type]');
            var resetButton = panel.querySelector('[data-filter-reset]');
            var result = panel.querySelector('[data-filter-result]');
            var params = new URLSearchParams(window.location.search);
            var queryFromUrl = params.get('q');

            if (queryFromUrl && searchInput) {
                searchInput.value = queryFromUrl;
            }

            function applyFilters() {
                var query = normalize(searchInput && searchInput.value);
                var year = normalize(yearSelect && yearSelect.value);
                var region = normalize(regionSelect && regionSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-category'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-text')
                    ].join(' '));
                    var matched = true;

                    if (query && haystack.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (year && normalize(card.getAttribute('data-year')) !== year) {
                        matched = false;
                    }
                    if (region && normalize(card.getAttribute('data-region')) !== region) {
                        matched = false;
                    }
                    if (type && normalize(card.getAttribute('data-type')) !== type) {
                        matched = false;
                    }

                    card.classList.toggle('is-filter-hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (result) {
                    result.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
                }
            }

            [searchInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilters);
                    control.addEventListener('change', applyFilters);
                }
            });

            if (resetButton) {
                resetButton.addEventListener('click', function () {
                    if (searchInput) {
                        searchInput.value = '';
                    }
                    if (yearSelect) {
                        yearSelect.value = '';
                    }
                    if (regionSelect) {
                        regionSelect.value = '';
                    }
                    if (typeSelect) {
                        typeSelect.value = '';
                    }
                    applyFilters();
                });
            }

            applyFilters();
        });
    }

    function setupPlayer() {
        var shell = document.querySelector('[data-player-shell]');
        var video = document.getElementById('movie-player');
        var button = document.querySelector('[data-player-start]');
        var status = document.querySelector('[data-player-status]');

        if (!shell || !video) {
            return;
        }

        var source = video.getAttribute('data-src');
        var hls = null;
        var initialized = false;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function initializePlayer() {
            if (initialized) {
                return Promise.resolve();
            }
            initialized = true;
            setStatus('正在初始化播放源...');

            return new Promise(function (resolve) {
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('播放源加载完成。');
                        resolve();
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            setStatus('网络波动，正在重新加载播放源。');
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            setStatus('媒体解码异常，正在尝试恢复。');
                            hls.recoverMediaError();
                        } else {
                            setStatus('播放源暂时无法加载，请稍后重试。');
                            hls.destroy();
                        }
                    });
                    window.setTimeout(resolve, 1200);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        setStatus('播放源加载完成。');
                        resolve();
                    }, { once: true });
                    window.setTimeout(resolve, 900);
                } else {
                    video.src = source;
                    setStatus('当前浏览器可能需要 HLS 支持，已尝试直接加载播放源。');
                    resolve();
                }
            });
        }

        function playVideo() {
            initializePlayer().then(function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        setStatus('浏览器限制自动播放，请再次点击播放器上的播放按钮。');
                    });
                }
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });

        video.addEventListener('click', function () {
            if (!initialized) {
                playVideo();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    setupHero();
    setupFilters();
    setupPlayer();
})();
