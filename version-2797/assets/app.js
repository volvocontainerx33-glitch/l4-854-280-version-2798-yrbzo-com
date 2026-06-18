(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMobileMenu() {
        var button = $("[data-menu-toggle]");
        var panel = $("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initGlobalSearch() {
        $all("[data-global-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                }
            });
        });
    }

    function initHero() {
        var hero = $("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = $all("[data-hero-slide]", hero);
        var dots = $all("[data-hero-dot]", hero);
        var prev = $("[data-hero-prev]", hero);
        var next = $("[data-hero-next]", hero);
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var scope = $("[data-filter-scope]");
        var list = $("[data-card-list]");
        if (!scope || !list) {
            return;
        }
        var input = $("[data-filter-input]", scope);
        var year = $("[data-year-filter]", scope);
        var type = $("[data-type-filter]", scope);
        var empty = $("[data-empty-tip]");
        var cards = $all("[data-card]", list);

        function update() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var yearValue = year ? year.value : "";
            var typeValue = type ? type.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
                var matchType = !typeValue || card.getAttribute("data-type") === typeValue;
                var keep = matchQuery && matchYear && matchType;
                card.style.display = keep ? "" : "none";
                if (keep) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", update);
                control.addEventListener("change", update);
            }
        });
        update();
    }

    function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<a class=\"movie-card\" href=\"./" + escapeHtml(movie.url) + "\">" +
            "<span class=\"cover-wrap\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"></span>" +
            "<span class=\"movie-card-body\">" +
            "<strong>" + escapeHtml(movie.title) + "</strong>" +
            "<span class=\"movie-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</span>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<span class=\"tag-line\">" + tags + "</span>" +
            "</span></a>";
    }

    function initSearchPage() {
        var page = $("[data-search-page]");
        if (!page || !window.MOVIE_INDEX) {
            return;
        }
        var input = $("[data-site-search]", page);
        var form = $("[data-search-form]", page);
        var results = $("[data-search-results]", page);
        var empty = $("[data-search-empty]", page);
        var params = new URLSearchParams(window.location.search);
        if (input) {
            input.value = params.get("q") || "";
        }

        function render() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var terms = query.split(/\s+/).filter(Boolean);
            var matches = window.MOVIE_INDEX.filter(function (movie) {
                if (!terms.length) {
                    return true;
                }
                var text = movie.search || "";
                return terms.every(function (term) {
                    return text.indexOf(term) !== -1;
                });
            }).slice(0, 120);
            if (results) {
                results.innerHTML = matches.map(cardTemplate).join("");
            }
            if (empty) {
                empty.classList.toggle("is-visible", matches.length === 0);
            }
        }

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var nextQuery = input ? input.value.trim() : "";
                var nextUrl = nextQuery ? "./search.html?q=" + encodeURIComponent(nextQuery) : "./search.html";
                history.replaceState(null, "", nextUrl);
                render();
            });
        }
        if (input) {
            input.addEventListener("input", render);
        }
        render();
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initGlobalSearch();
        initHero();
        initFilters();
        initSearchPage();
    });
})();
