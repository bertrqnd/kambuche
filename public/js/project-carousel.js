const slides = document.querySelectorAll('.carousel-slide');
const prevBtn = document.querySelector('.carousel__btn--prev');
const nextBtn = document.querySelector('.carousel__btn--next');
const indicatorsContainer = document.querySelector('.carousel__indicators');

let currentIndex = 0;

// Création des indicateurs
slides.forEach((_, i) => {
  const dot = document.createElement('span');
  dot.classList.add('carousel__indicator');
  if(i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => {
    showSlide(i);
  });
  indicatorsContainer.appendChild(dot);
});

const indicators = document.querySelectorAll('.carousel__indicator');

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.style.display = i === index ? 'block' : 'none';
    indicators[i].classList.toggle('active', i === index);
  });
  currentIndex = index;
}

prevBtn.addEventListener('click', () => {
  showSlide((currentIndex - 1 + slides.length) % slides.length);
});

nextBtn.addEventListener('click', () => {
  showSlide((currentIndex + 1) % slides.length);
});

showSlide(currentIndex);
