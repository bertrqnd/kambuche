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

  const updateCarousel = (index) => {
    if (projectsData.length === 0) return;
    const project = projectsData[index];
    imageElement.src = project.cover_image_url || '/images/default.jpg';
    imageElement.alt = project.title;
    titleElement.textContent = project.title;
    descElement.textContent = project.description || '';
    linkElement.href = `/projets/${project.slug}`;
  };

  btnNext?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % projectsData.length;
    updateCarousel(currentIndex);
  });

  btnPrev?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + projectsData.length) % projectsData.length;
    updateCarousel(currentIndex);
  });

  updateCarousel(currentIndex);
});
