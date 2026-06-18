const navButton = document.querySelector('.mobile-nav-toggle');
const mobileNav = document.querySelector('.mobile-nav');

if (navButton && mobileNav) {
  navButton.addEventListener('click', () => {
    const expanded = navButton.getAttribute('aria-expanded') === 'true';
    navButton.setAttribute('aria-expanded', String(!expanded));
    mobileNav.hidden = expanded;
  });
}

const carousel = document.querySelector('[data-hero-carousel]');

if (carousel) {
  const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
  const dots = Array.from(carousel.querySelectorAll('.hero-dots button'));
  const prev = carousel.querySelector('[data-hero-prev]');
  const next = carousel.querySelector('[data-hero-next]');
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
    });
  };

  const start = () => {
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  const reset = () => {
    window.clearInterval(timer);
    start();
  };

  prev?.addEventListener('click', () => {
    show(index - 1);
    reset();
  });

  next?.addEventListener('click', () => {
    show(index + 1);
    reset();
  });

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      show(dotIndex);
      reset();
    });
  });

  show(0);
  start();
}

const filterGrid = document.querySelector('[data-filter-grid]');
const filterInput = document.querySelector('[data-filter-input]');
const categoryFilter = document.querySelector('[data-category-filter]');
const yearFilter = document.querySelector('[data-year-filter]');
const regionFilter = document.querySelector('[data-region-filter]');
const noResults = document.querySelector('[data-no-results]');

if (filterGrid) {
  const cards = Array.from(filterGrid.querySelectorAll('.movie-card'));
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';

  if (filterInput && query) {
    filterInput.value = query;
  }

  const applyFilters = () => {
    const keyword = (filterInput?.value || '').trim().toLowerCase();
    const category = categoryFilter?.value || '';
    const year = yearFilter?.value || '';
    const region = regionFilter?.value || '';
    let visible = 0;

    cards.forEach((card) => {
      const haystack = [
        card.dataset.title,
        card.dataset.category,
        card.dataset.region,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(' ').toLowerCase();
      const matchedKeyword = !keyword || haystack.includes(keyword);
      const matchedCategory = !category || card.dataset.category === category;
      const matchedYear = !year || card.dataset.year === year;
      const matchedRegion = !region || card.dataset.region.includes(region);
      const matched = matchedKeyword && matchedCategory && matchedYear && matchedRegion;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (noResults) {
      noResults.classList.toggle('show', visible === 0);
    }
  };

  [filterInput, categoryFilter, yearFilter, regionFilter].forEach((control) => {
    control?.addEventListener('input', applyFilters);
    control?.addEventListener('change', applyFilters);
  });

  applyFilters();
}
