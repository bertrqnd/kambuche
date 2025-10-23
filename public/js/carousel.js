document.addEventListener('DOMContentLoaded', () => {
  const dataElement = document.getElementById('carousel-data');
  const projectsData = JSON.parse(dataElement.dataset.projects || '[]');
  let currentIndex = 0;

  const imageElement = document.querySelector('.carousel__image img');
  const titleElement = document.querySelector('.carousel__text h3');
  const descElement = document.querySelector('.carousel__text p');
  const linkElement = document.querySelector('.carousel__link');
  const btnNext = document.querySelector('.carousel__btn--next');
  const btnPrev = document.querySelector('.carousel__btn--prev');
  const indicatorsContainer = document.querySelector('.carousel__indicators');

  if (!imageElement || !titleElement || !descElement || !linkElement || !indicatorsContainer) return;

  // === Création des indicateurs ===
  projectsData.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('carousel__indicator');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      currentIndex = i;
      updateCarousel(currentIndex);
    });
    indicatorsContainer.appendChild(dot);
  });

  // === Fonction pour mettre à jour le carousel ET les indicateurs ===
  const updateCarousel = (index) => {
    if (projectsData.length === 0) return;

    const project = projectsData[index];
    imageElement.src = project.image || '/images/default.jpg';
    imageElement.alt = project.title;
    titleElement.textContent = project.title;
    // descElement.textContent = project.description || '';
    linkElement.href = `/projets/${project.slug}`;

    // Animation fade-in
    imageElement.classList.remove('fadeIn');
    void imageElement.offsetWidth; // force reflow
    imageElement.classList.add('fadeIn');

    // Mise à jour des indicateurs
    document.querySelectorAll('.carousel__indicator').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  };

  // === Listeners des boutons ===
  btnNext?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % projectsData.length;
    updateCarousel(currentIndex);
  });

  btnPrev?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + projectsData.length) % projectsData.length;
    updateCarousel(currentIndex);
  });

  // Affichage initial
  updateCarousel(currentIndex);
});

// === MENU BURGER ===
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

if (burger && navLinks) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    navLinks.classList.toggle('mobile-active');
  });
}

// === Swipe pour le carrousel ===
const carousel = document.querySelector('.carousel');
let startX = 0;
let endX = 0;

carousel.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});

carousel.addEventListener('touchmove', (e) => {
  endX = e.touches[0].clientX;
});

carousel.addEventListener('touchend', () => {
  const diffX = endX - startX;
  const threshold = 50; // distance minimale du swipe

  if (Math.abs(diffX) > threshold) {
    if (diffX > 0) {
      // Swipe vers la droite → image précédente
      document.querySelector('.carousel__btn--prev').click();
    } else {
      // Swipe vers la gauche → image suivante
      document.querySelector('.carousel__btn--next').click();
    }
  }
});
