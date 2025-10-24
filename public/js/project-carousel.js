// === CAROUSEL ===
const carousel = document.querySelector('.project-carousel');
const slides = Array.from(document.querySelectorAll('.carousel-slide'));
const prevBtn = document.querySelector('.carousel__btn--prev');
const nextBtn = document.querySelector('.carousel__btn--next');
const indicatorsContainer = document.querySelector('.carousel__indicators');

if (carousel && slides.length > 0 && prevBtn && nextBtn && indicatorsContainer) {
  let currentIndex = 0;

  // Créer wrapper
  const slidesWrapper = document.createElement('div');
  slidesWrapper.classList.add('slides-wrapper');
  slides.forEach(slide => slidesWrapper.appendChild(slide));
  carousel.insertBefore(slidesWrapper, carousel.firstChild);

  // Création indicateurs
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.classList.add('carousel__indicator');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => showSlide(i));
    indicatorsContainer.appendChild(dot);
  });

  const indicators = Array.from(document.querySelectorAll('.carousel__indicator'));

  function showSlide(index) {
    slidesWrapper.style.transform = `translateX(-${index * 100}%)`;
    indicators.forEach((dot, i) => dot.classList.toggle('active', i === index));
    currentIndex = index;
  }

  prevBtn.addEventListener('click', () => {
    showSlide((currentIndex - 1 + slides.length) % slides.length);
  });

  nextBtn.addEventListener('click', () => {
    showSlide((currentIndex + 1) % slides.length);
  });

  // Swipe carousel uniquement
  let startX = 0;
  carousel.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  });
  carousel.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        showSlide((currentIndex - 1 + slides.length) % slides.length);
      } else {
        showSlide((currentIndex + 1) % slides.length);
      }
    }
  });

  // Navigation clavier
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
      showSlide((currentIndex - 1 + slides.length) % slides.length);
    } else if (e.key === 'ArrowRight') {
      showSlide((currentIndex + 1) % slides.length);
    }
  });

  showSlide(currentIndex);
}

// === LIGHTBOX SANS SWIPE ===
const lightbox = document.getElementById('lightbox');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');
const lightboxSlidesContainer = lightbox.querySelector('.lightbox-slides');

if (lightbox && lightboxClose && lightboxPrev && lightboxNext && slides.length > 0) {
  let lightboxIndex = 0;

  // Créer les slides lightbox
  slides.forEach(slide => {
    const lightboxSlide = document.createElement('div');
    lightboxSlide.classList.add('lightbox-slide');
    
    const img = slide.querySelector('img');
    const lightboxImg = img.cloneNode(true);
    lightboxImg.style.cursor = 'default';
    
    lightboxSlide.appendChild(lightboxImg);
    lightboxSlidesContainer.appendChild(lightboxSlide);
  });

  // Ouvrir lightbox sur clic image
  slides.forEach((slide, i) => {
    const img = slide.querySelector('img');
    img.addEventListener('click', () => {
      lightboxIndex = i;
      lightbox.style.display = 'block';
      document.body.style.overflow = 'hidden';
      updateLightbox();
    });
  });

  function updateLightbox() {
    lightboxSlidesContainer.style.transform = `translateX(-${lightboxIndex * 100}%)`;
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Navigation lightbox
  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    lightboxIndex = (lightboxIndex - 1 + slides.length) % slides.length;
    updateLightbox();
  });

  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    lightboxIndex = (lightboxIndex + 1) % slides.length;
    updateLightbox();
  });

  lightboxClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  // Fermer en cliquant sur le fond
  const backdrop = lightbox.querySelector('.lightbox-backdrop');
  backdrop.addEventListener('click', closeLightbox);

  // Navigation clavier dans lightbox (sans swipe)
  document.addEventListener('keydown', e => {
    if (lightbox.style.display === 'block') {
      if (e.key === 'ArrowLeft') {
        lightboxIndex = (lightboxIndex - 1 + slides.length) % slides.length;
        updateLightbox();
      } else if (e.key === 'ArrowRight') {
        lightboxIndex = (lightboxIndex + 1) % slides.length;
        updateLightbox();
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    }
  });
}