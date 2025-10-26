
document.addEventListener('DOMContentLoaded', () => {
  // === CAROUSEL (desktop et landscape uniquement) ===
  const dataElement = document.getElementById('carousel-data');
  const projectsData = JSON.parse(dataElement?.dataset.projects || '[]');
  let currentIndex = 0;
  let autoplayInterval = null;

  const carousel = document.querySelector('.carousel');
  const btnNext = document.querySelector('.carousel__btn--next');
  const btnPrev = document.querySelector('.carousel__btn--prev');
  const indicatorsContainer = document.querySelector('.carousel__indicators');

  if (carousel && btnNext && btnPrev && indicatorsContainer && projectsData.length > 0) {
    const slidesWrapper = document.createElement('div');
    slidesWrapper.classList.add('slides-wrapper');
    carousel.insertBefore(slidesWrapper, indicatorsContainer);

    // Créer les slides
    projectsData.forEach((project, i) => {
      const slide = document.createElement('div');
      slide.classList.add('carousel-slide');
      
      const img = document.createElement('img');
      img.src = project.image || '/images/default.jpg';
      img.alt = project.title;
      
      const overlayClone = document.createElement('div');
      overlayClone.classList.add('carousel__overlay');
      overlayClone.innerHTML = `
        <div class="carousel__text">
          <h3>${project.title}</h3>
          <p>${project.description || ''}</p>
          <a href="/projets/${project.slug}" class="carousel__link">Voir le projet</a>
        </div>
      `;
      
      slide.appendChild(img);
      slide.appendChild(overlayClone);
      slidesWrapper.appendChild(slide);

      // Créer les indicateurs
      const dot = document.createElement('div');
      dot.classList.add('carousel__indicator');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        showSlide(i);
        resetAutoplay();
      });
      indicatorsContainer.appendChild(dot);
    });

    const indicators = document.querySelectorAll('.carousel__indicator');

    function showSlide(index) {
      slidesWrapper.style.transform = `translateX(-${index * 100}%)`;
      indicators.forEach((dot, i) => dot.classList.toggle('active', i === index));
      currentIndex = index;
    }

    function nextSlide() {
      showSlide((currentIndex + 1) % projectsData.length);
    }

    function prevSlide() {
      showSlide((currentIndex - 1 + projectsData.length) % projectsData.length);
    }

    // Autoplay
    function startAutoplay() {
      autoplayInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoplay() {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
      }
    }

    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    // Boutons navigation
    btnNext.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });

    btnPrev.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });

    // Navigation tactile
    let startX = 0, endX = 0;
    slidesWrapper.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      stopAutoplay();
    });
    slidesWrapper.addEventListener('touchmove', e => {
      endX = e.touches[0].clientX;
    });
    slidesWrapper.addEventListener('touchend', () => {
      const diffX = endX - startX;
      if (Math.abs(diffX) > 50) {
        diffX > 0 ? prevSlide() : nextSlide();
      }
      startAutoplay();
    });

    // Navigation clavier
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        resetAutoplay();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        resetAutoplay();
      }
    });

    // Pause autoplay au survol
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);

    // Démarrer
    showSlide(currentIndex);
    startAutoplay();
  }

  // === MENU BURGER ===
  const burger = document.querySelector('.burger');
  const navLinksMobile = document.querySelector('.nav-links-mobile');

  if (burger && navLinksMobile) {
    // Toggle menu mobile
    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      burger.classList.toggle('active');
      navLinksMobile.classList.toggle('mobile-active');
    });

    // Fermer le menu en cliquant sur un lien
    const navItemsMobile = navLinksMobile.querySelectorAll('.nav-item-mobile');
    navItemsMobile.forEach(item => {
      item.addEventListener('click', () => {
        burger.classList.remove('active');
        navLinksMobile.classList.remove('mobile-active');
      });
    });

    // Fermer le menu en cliquant ailleurs
    document.addEventListener('click', (e) => {
      if (!navLinksMobile.contains(e.target) && !burger.contains(e.target)) {
        burger.classList.remove('active');
        navLinksMobile.classList.remove('mobile-active');
      }
    });
  }

  // === SCROLL TO TOP (mobile) ===
  const navLeft = document.querySelector('.nav-left');
  if (navLeft) {
    navLeft.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // === SAUVEGARDER POSITION SCROLL ===
  const projectLinks = document.querySelectorAll('.project-card__link');
  projectLinks.forEach((link, index) => {
    link.addEventListener('click', () => {
      sessionStorage.setItem('scrollToProject', index);
    });
  });

  // === RESTAURER POSITION SCROLL ===
  const scrollToProject = sessionStorage.getItem('scrollToProject');
  if (scrollToProject !== null) {
    sessionStorage.removeItem('scrollToProject');
    setTimeout(() => {
      const projectCard = document.getElementById(`project-${scrollToProject}`);
      if (projectCard) {
        projectCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
});