document.addEventListener('DOMContentLoaded', () => {
  const dataElement = document.getElementById('carousel-data');
  const projectsData = JSON.parse(dataElement?.dataset.projects || '[]');
  const introText = dataElement?.dataset.introText || 'Diplômée d\'architecture, je vous accompagne dans vos projets de construction, extension et rénovation';
  let currentIndex = 0;
  let autoplayInterval = null;

  const carousel = document.querySelector('.carousel');
  const btnNext = document.querySelector('.carousel__btn--next');
  const btnPrev = document.querySelector('.carousel__btn--prev');
  const indicatorsContainer = document.querySelector('.carousel__indicators');

  // Vérifier si on doit ajouter la slide d'intro
  // Fonction helper pour gérer localStorage avec fallback
  function safeCheckIntroVisibility() {
    try {
      return localStorage.getItem('shouldHideIntroSlide') === 'true';
    } catch (e) {
      // Fallback: utiliser sessionStorage si localStorage est bloqué
      try {
        return sessionStorage.getItem('shouldHideIntroSlide') === 'true';
      } catch {
        // Si tout échoue, cacher l'intro par sécurité (meilleure UX)
        return true;
      }
    }
  }

  const hasVisitedProject = safeCheckIntroVisibility();

  if (carousel && btnNext && btnPrev && indicatorsContainer && projectsData.length > 0) {
    const slidesWrapper = document.createElement('div');
    slidesWrapper.classList.add('slides-wrapper');
    carousel.insertBefore(slidesWrapper, indicatorsContainer);

    // Ajouter la slide d'intro si l'utilisateur n'a jamais visité de projet
    if (!hasVisitedProject) {
      const introSlide = document.createElement('div');
      introSlide.classList.add('carousel-slide', 'carousel-slide--intro');

      const introOverlay = document.createElement('div');
      introOverlay.classList.add('carousel__overlay');

      const introTextDiv = document.createElement('div');
      introTextDiv.classList.add('carousel__text');

      const introH3 = document.createElement('h3');
      introH3.textContent = introText;

      const introButton = document.createElement('button');
      introButton.classList.add('intro-cta-btn');
      introButton.textContent = 'Voir mes projets';
      introButton.addEventListener('click', () => {
        nextSlide();
        resetAutoplay();
      });

      introTextDiv.appendChild(introH3);
      introTextDiv.appendChild(introButton);
      introOverlay.appendChild(introTextDiv);
      introSlide.appendChild(introOverlay);
      slidesWrapper.appendChild(introSlide);

      // Ajouter l'indicateur pour la slide d'intro
      const introDot = document.createElement('div');
      introDot.classList.add('carousel__indicator', 'active');
      introDot.addEventListener('click', () => {
        showSlide(0);
        resetAutoplay();
      });
      indicatorsContainer.appendChild(introDot);
    }

    projectsData.forEach((project, i) => {
      const slide = document.createElement('div');
      slide.classList.add('carousel-slide');

      const img = document.createElement('img');
      const originalUrl = project.image || '/images/default.jpg';
      if (originalUrl.includes('cloudinary.com')) {
        img.src = originalUrl.replace('/upload/', '/upload/w_1920,f_auto,q_auto/');
        img.srcset = `
          ${originalUrl.replace('/upload/', '/upload/w_800,f_auto,q_auto/')} 800w,
          ${originalUrl.replace('/upload/', '/upload/w_1200,f_auto,q_auto/')} 1200w,
          ${originalUrl.replace('/upload/', '/upload/w_1920,f_auto,q_auto/')} 1920w
        `.trim();
        img.sizes = '100vw';
      } else {
        img.src = originalUrl;
      }
      img.alt = project.title;
      if (i === 0) {
        img.fetchPriority = 'high';
      } else {
        img.loading = 'lazy';
      }
      
      const overlayClone = document.createElement('div');
      overlayClone.classList.add('carousel__overlay');

      const textDiv = document.createElement('div');
      textDiv.classList.add('carousel__text');

      const h3 = document.createElement('h3');
      h3.textContent = project.title;

      const p = document.createElement('p');
      p.textContent = project.short_description || '';

      const a = document.createElement('a');
      a.href = `/projets/${project.slug}`;
      a.classList.add('carousel__link');
      a.setAttribute('data-slide-index', i);
      a.textContent = 'Voir le projet';

      textDiv.appendChild(h3);
      textDiv.appendChild(p);
      textDiv.appendChild(a);
      overlayClone.appendChild(textDiv);
      
      slide.appendChild(img);
      slide.appendChild(overlayClone);
      slidesWrapper.appendChild(slide);

      const slideOffset = hasVisitedProject ? 0 : 1; // Décalage si slide intro existe
      const dot = document.createElement('div');
      dot.classList.add('carousel__indicator');
      if (i === 0 && hasVisitedProject) dot.classList.add('active');
      dot.addEventListener('click', () => {
        showSlide(i + slideOffset);
        resetAutoplay();
      });
      indicatorsContainer.appendChild(dot);
    });

    const indicators = document.querySelectorAll('.carousel__indicator');
    const totalSlides = hasVisitedProject ? projectsData.length : projectsData.length + 1;

    function showSlide(index) {
      slidesWrapper.style.transform = `translateX(-${index * 100}%)`;
      indicators.forEach((dot, i) => dot.classList.toggle('active', i === index));
      currentIndex = index;

      // Cacher les contrôles (flèches + indicateurs) si on est sur la slide d'intro
      const isOnIntro = !hasVisitedProject && index === 0;
      if (isOnIntro) {
        btnNext.style.display = 'none';
        btnPrev.style.display = 'none';
        indicatorsContainer.style.display = 'none';
      } else {
        btnNext.style.display = '';
        btnPrev.style.display = '';
        indicatorsContainer.style.display = '';
      }
    }

    function nextSlide() {
      showSlide((currentIndex + 1) % totalSlides);
    }

    function prevSlide() {
      showSlide((currentIndex - 1 + totalSlides) % totalSlides);
    }

    // Autoplay avec durée adaptée selon le type de slide
    function startAutoplay() {
      // Donner plus de temps (15s) si on est sur l'intro slide, sinon 10s
      const isOnIntroSlide = !hasVisitedProject && currentIndex === 0;
      const delay = isOnIntroSlide ? 15000 : 10000;
      autoplayInterval = setInterval(nextSlide, delay);
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

    btnNext.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });

    btnPrev.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });

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

    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        resetAutoplay();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        resetAutoplay();
      }
    });

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);

    carousel.addEventListener('click', (e) => {
      if (e.target.classList.contains('carousel__link')) {
        const slideIndex = e.target.getAttribute('data-slide-index');
        if (slideIndex) {
          const slideOffset = hasVisitedProject ? 0 : 1;
          sessionStorage.setItem('carouselSlideIndex', parseInt(slideIndex) + slideOffset);
        }
      }
    });

    const savedSlideIndex = sessionStorage.getItem('carouselSlideIndex');
    if (savedSlideIndex !== null) {
      sessionStorage.removeItem('carouselSlideIndex');
      currentIndex = parseInt(savedSlideIndex, 10);
      showSlide(currentIndex);
    } else {
      showSlide(currentIndex);
    }

    startAutoplay();
  }

  const burger = document.querySelector('.burger');
  const navLinksMobile = document.querySelector('.nav-links-mobile');

  if (burger && navLinksMobile) {
    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      burger.classList.toggle('active');
      navLinksMobile.classList.toggle('mobile-active');
    });

    const navItemsMobile = navLinksMobile.querySelectorAll('.nav-item-mobile');
    navItemsMobile.forEach(item => {
      item.addEventListener('click', () => {
        burger.classList.remove('active');
        navLinksMobile.classList.remove('mobile-active');
      });
    });

    document.addEventListener('click', (e) => {
      if (!navLinksMobile.contains(e.target) && !burger.contains(e.target)) {
        burger.classList.remove('active');
        navLinksMobile.classList.remove('mobile-active');
      }
    });
  }

  const navLeft = document.querySelector('.nav-left');
  if (navLeft) {
    navLeft.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const projectLinks = document.querySelectorAll('.project-card__link');
  projectLinks.forEach((link, index) => {
    link.addEventListener('click', () => {
      sessionStorage.setItem('scrollToProject', index);
    });
  });

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

  // Ajouter la carte d'intro en mobile si l'utilisateur n'a jamais visité de projet
  const projectsMobile = document.querySelector('.projects-mobile');
  if (projectsMobile && !hasVisitedProject) {
    const introCard = document.createElement('article');
    introCard.classList.add('project-card', 'project-card--intro');
    introCard.id = 'intro-card';

    const introContent = document.createElement('div');
    introContent.classList.add('project-card__content', 'project-card__content--intro');

    const introTextPara = document.createElement('p');
    introTextPara.classList.add('project-card__intro-text');
    introTextPara.textContent = introText;

    // Pas de bouton "Voir mes projets" en mode mobile
    introContent.appendChild(introTextPara);
    introCard.appendChild(introContent);

    // Insérer la carte d'intro en première position
    projectsMobile.insertBefore(introCard, projectsMobile.firstChild);
  }
});