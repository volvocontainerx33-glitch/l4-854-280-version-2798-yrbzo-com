(function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    function startHero() {
        if (slides.length <= 1) {
            return;
        }

        clearInterval(timer);
        timer = setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startHero();
        });
    });

    startHero();

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter(scope) {
        var input = scope.querySelector('.filter-input');
        var year = scope.querySelector('.filter-select');
        var type = scope.querySelector('.filter-type');
        var list = scope.parentElement.querySelector('.filter-list');

        if (!list) {
            return;
        }

        var query = normalize(input && input.value);
        var selectedYear = normalize(year && year.value);
        var selectedType = normalize(type && type.value);
        var entries = Array.prototype.slice.call(list.children);

        entries.forEach(function (entry) {
            var haystack = normalize([
                entry.getAttribute('data-title'),
                entry.getAttribute('data-type'),
                entry.getAttribute('data-year'),
                entry.getAttribute('data-region'),
                entry.getAttribute('data-genre'),
                entry.textContent
            ].join(' '));
            var entryYear = normalize(entry.getAttribute('data-year'));
            var entryType = normalize(entry.getAttribute('data-type'));
            var matchQuery = !query || haystack.indexOf(query) !== -1;
            var matchYear = !selectedYear || entryYear === selectedYear;
            var matchType = !selectedType || entryType === selectedType;

            entry.classList.toggle('filter-hidden', !(matchQuery && matchYear && matchType));
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
        var fields = scope.querySelectorAll('input, select');
        Array.prototype.slice.call(fields).forEach(function (field) {
            field.addEventListener('input', function () {
                applyFilter(scope);
            });
            field.addEventListener('change', function () {
                applyFilter(scope);
            });
        });
    });

    var searchParams = new URLSearchParams(window.location.search);
    var query = searchParams.get('q');

    if (query) {
        Array.prototype.slice.call(document.querySelectorAll('.filter-input')).forEach(function (input) {
            input.value = query;
            var scope = input.closest('[data-filter-scope]');
            if (scope) {
                applyFilter(scope);
            }
        });
    }
})();
