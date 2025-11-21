document.addEventListener('DOMContentLoaded', () => {
  // === GRID CAROUSEL (desktop et landscape uniquement) ===
  const dataElement = document.getElementById('carousel-data');
  const projectsData = JSON.parse(dataElement?.dataset.projects || '[]');
  let currentPage = 0;
  let itemsPerPage = 6; // 2 rows × 3 columns

  const carousel = document.querySelector('.carousel');
  const btnNext = document.querySelector('.carousel__btn--next');
  const btnPrev = document.querySelector('.carousel__btn--prev');
  const indicatorsContainer = document.querySelector('.carousel__indicators');

  // Détecter le nombre de colonnes selon la taille d'écran
  function updateItemsPerPage() {
    const width = window.innerWidth;
    if (width <= 768) {
      itemsPerPage = 2; // Mobile: 2 items (liste verticale gérée séparément)
    } else if (width <= 1024) {
      itemsPerPage = 4; // Tablette: 2 rows × 2 columns
    } else {
      itemsPerPage = 6; // Desktop: 2 rows × 3 columns
    }
  }

  if (carousel && btnNext && btnPrev && indicatorsContainer && projectsData.length > 0) {
    const slidesWrapper = document.createElement('div');
    slidesWrapper.classList.add('slides-wrapper');
    carousel.insertBefore(slidesWrapper, indicatorsContainer);

    // Créer les slides (cartes de projet)
    projectsData.forEach((project, i) => {
      const slide = document.createElement('a');
      slide.classList.add('carousel-slide');
      slide.href = `/projets/${project.slug}`;
      slide.setAttribute('data-project-index', i);

      // Container pour l'image
      const imageContainer = document.createElement('div');
      imageContainer.classList.add('carousel-slide__image');

      const img = document.createElement('img');
      img.src = project.image || '/images/default.jpg';
      img.alt = project.title;
      img.loading = i < 6 ? 'eager' : 'lazy'; // Eager loading pour les 6 premiers

      imageContainer.appendChild(img);

      // Container pour le contenu texte
      const contentDiv = document.createElement('div');
      contentDiv.classList.add('carousel-slide__content');

      const title = document.createElement('h3');
      title.classList.add('carousel-slide__title');
      title.textContent = project.title;

      const description = document.createElement('p');
      description.classList.add('carousel-slide__description');
      description.textContent = project.short_description || '';

      contentDiv.appendChild(title);
      contentDiv.appendChild(description);

      slide.appendChild(imageContainer);
      slide.appendChild(contentDiv);
      slidesWrapper.appendChild(slide);
    });

    // Calculer le nombre de pages
    updateItemsPerPage();
    const totalPages = Math.ceil(projectsData.length / itemsPerPage);

    // Créer les indicateurs de page
    function createIndicators() {
      indicatorsContainer.innerHTML = '';
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.classList.add('carousel__indicator');
        dot.setAttribute('aria-label', `Page ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => showPage(i));
        indicatorsContainer.appendChild(dot);
      }
    }

    createIndicators();
    const indicators = document.querySelectorAll('.carousel__indicator');

    function showPage(pageIndex) {
      // S'assurer que l'index est dans les limites
      if (pageIndex < 0) pageIndex = totalPages - 1;
      if (pageIndex >= totalPages) pageIndex = 0;

      currentPage = pageIndex;

      // Cacher tous les slides
      const slides = document.querySelectorAll('.carousel-slide');
      slides.forEach((slide, i) => {
        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        if (i >= startIndex && i < endIndex) {
          slide.style.display = 'flex';
        } else {
          slide.style.display = 'none';
        }
      });

      // Mettre à jour les indicateurs
      indicators.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentPage);
      });

      // Gérer la visibilité des boutons
      updateButtonsVisibility();
    }

    function updateButtonsVisibility() {
      if (totalPages <= 1) {
        btnPrev.style.display = 'none';
        btnNext.style.display = 'none';
      } else {
        btnPrev.style.display = 'block';
        btnNext.style.display = 'block';
        btnPrev.style.opacity = currentPage === 0 ? '0.3' : '0.7';
        btnNext.style.opacity = currentPage === totalPages - 1 ? '0.3' : '0.7';
      }
    }

    function nextPage() {
      if (currentPage < totalPages - 1) {
        showPage(currentPage + 1);
      }
    }

    function prevPage() {
      if (currentPage > 0) {
        showPage(currentPage - 1);
      }
    }

    // Boutons navigation
    btnNext.addEventListener('click', nextPage);
    btnPrev.addEventListener('click', prevPage);

    // Navigation clavier
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') {
        prevPage();
      } else if (e.key === 'ArrowRight') {
        nextPage();
      }
    });

    // Sauvegarder l'index du projet au clic
    carousel.addEventListener('click', (e) => {
      const projectLink = e.target.closest('.carousel-slide');
      if (projectLink) {
        const projectIndex = projectLink.getAttribute('data-project-index');
        sessionStorage.setItem('carouselProjectIndex', projectIndex);
        sessionStorage.setItem('carouselPage', currentPage);
      }
    });

    // Restaurer la page et scroller vers le projet au chargement
    const savedProjectIndex = sessionStorage.getItem('carouselProjectIndex');
    const savedPage = sessionStorage.getItem('carouselPage');

    if (savedProjectIndex !== null && savedPage !== null) {
      sessionStorage.removeItem('carouselProjectIndex');
      sessionStorage.removeItem('carouselPage');
      currentPage = parseInt(savedPage, 10);
      showPage(currentPage);
    } else {
      showPage(0);
    }

    // Recalculer lors du redimensionnement
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const oldItemsPerPage = itemsPerPage;
        updateItemsPerPage();

        if (oldItemsPerPage !== itemsPerPage) {
          createIndicators();
          showPage(0); // Retour à la première page lors du resize
        }
      }, 250);
    });
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