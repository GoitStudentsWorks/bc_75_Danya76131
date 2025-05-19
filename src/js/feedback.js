import Swiper from 'swiper';
  import 'swiper/css';
  import 'swiper/css/navigation';
  import { Navigation } from 'swiper/modules';

  // console.log('feedback block:', document.querySelector('.feedback'));

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM is ready');
  const feedback = document.querySelector('.feedback-section');
  if (!feedback) {
    console.warn('Feedback section отсутствует на этой странице');
    return;
  }

  

  // лоадер
  function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.remove('hidden');
      loader.classList.add('show');
    }
  }

  function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.remove('show');
      loader.classList.add('hidden');
    }
  }

  // зірочки на коментах
  function generateStars(rating) {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.round(rating);
      const iconId = isFilled ? 'icon-star-filled' : 'icon-star-empty';

      stars.push(`
      <svg class="star-icon" width="20" height="20">
        <use href="#${iconId}"></use>
      </svg>
    `);
    }

    return stars.join('');
  }




  async function fetchFeedback() {
    showLoader();
    try {
      const res = await fetch('https://sound-wave.b.goit.study/api/feedbacks');
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const { data } = await res.json();
      return data;
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      return [];
    } finally {
      hideLoader();
    }
  }

  async function initFeedbackSwiper() {
    const feedbacks = await fetchFeedback();
    const swiperWrapper = document.querySelector('.swiper-wrapper');
    const paginationContainer = document.querySelector('.custom-pagination');
    
    
    // ошибка не видит врапер
    
    // if (!swiperWrapper || !paginationContainer) {
    //   console.warn('❗ Swiper wrapper або pagination container не знайдено на сторінці');
    //   console.log('swiperWrapper:', swiperWrapper);
    //   console.log('paginationContainer:', paginationContainer);
    //   return;
    // }
  
    swiperWrapper.innerHTML = '';
    paginationContainer.innerHTML = '';

    feedbacks.forEach(feedback => {
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide');
      slide.innerHTML = `
      <div class="feedback-card">
        <div class="feedback-rating">${generateStars(feedback.rating)}</div>
        <p class="feedback-text">${feedback.descr}</p>
        <div class="feedback-info">
          <h3 class="feedback-name">${feedback.name}</h3>
        </div>
      </div>
    `;
      swiperWrapper.appendChild(slide);
    });

    const swiper = new Swiper('.feedback-swiper', {
      modules: [Navigation],
      loop: false,
      navigation: {
        nextEl: '.my-button-next',
        prevEl: '.my-button-prev',
      },
      slidesPerView: 1,
      spaceBetween: 0,
      on: {
        slideChange: () => updatePagination(swiper.realIndex, swiper.slides.length),
      },
    });

    function renderCustomPagination(slideCount) {
      const leftDot = document.createElement('span');
      const centerDot = document.createElement('span');
      const rightDot = document.createElement('span');

      leftDot.classList.add('pagination-dot');
      leftDot.dataset.index = 0;

      centerDot.classList.add('pagination-dot');
      centerDot.dataset.index = Math.floor(slideCount / 2);

      rightDot.classList.add('pagination-dot');
      rightDot.dataset.index = slideCount - 1;

      paginationContainer.append(leftDot, centerDot, rightDot);
    }

    function updatePagination(activeIndex, slideCount) {
      const [leftDot, centerDot, rightDot] = document.querySelectorAll('.pagination-dot');
      leftDot.classList.toggle('active', activeIndex === 0);
      centerDot.classList.toggle('active', activeIndex !== 0 && activeIndex !== slideCount - 1);
      rightDot.classList.toggle('active', activeIndex === slideCount - 1);
    }

    paginationContainer.addEventListener('click', e => {
      if (e.target.classList.contains('pagination-dot')) {
        const index = Number(e.target.dataset.index);
        swiper.slideTo(index);
      }
    });

    renderCustomPagination(feedbacks.length);
    updatePagination(swiper.realIndex, feedbacks.length);
  }

  
  
    setTimeout(() => {
      initFeedbackSwiper();
    }, 200); 
  
  

  // Модальне вікно
  const modal = document.querySelector('.modal');
  const btnOpen = document.querySelector('.btn-open');
  const btnClose = document.querySelector('.btn-close');
  const form = document.querySelector('.feedback-form');
  const stars = document.querySelectorAll('.star');

  let currentRating = 0;

  btnOpen.addEventListener('click', () => {
    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  });

  btnClose.addEventListener('click', () => {
    closeModal();
  });

  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      currentRating = index + 1;
      updateStars(currentRating);
    });
  });

  function updateStars(rating) {
    stars.forEach((star, index) => {
      const use = star.querySelector('use');
      if (index < rating) {
        use.setAttribute('href', '#icon-star-filled');
        star.classList.add('active-star');
      } else {
        use.setAttribute('href', '#icon-star-empty');
        star.classList.remove('active-star');
      }
    });
  }

  function closeModal() {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.classList.add('hidden');
      form.reset();
      updateStars(0);
      currentRating = 0;
      clearValidationErrors();
    }, 300);
  }

  function clearValidationErrors() {
    const errors = form.querySelectorAll('.error-message');
    errors.forEach(err => {
      err.classList.add('hidden');
      err.textContent = '';
    });

    const inputs = form.querySelectorAll('.error');
    inputs.forEach(input => input.classList.remove('error'));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.elements.name.value.trim();
    const message = form.elements.message.value.trim();

    let isValid = true;

    const fields = [
      {
        input: form.elements.name,
        errorEl: form.elements.name.nextElementSibling,
        message: 'Text error',
      },
      {
        input: form.elements.message,
        errorEl: form.elements.message.nextElementSibling,
        message: 'Text error',
      },
    ];

    fields.forEach(({ input, errorEl, message }) => {
      if (!input.value.trim()) {
        input.classList.add('error');
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
        isValid = false;
      } else {
        input.classList.remove('error');
        errorEl.classList.add('hidden');
        errorEl.textContent = '';
      }
    });

    if (!isValid) return;

    const feedbackData = {
      name: name,
      rating: currentRating,
      descr: message,
    };
    showLoader();

    try {
      const response = await fetch('https://sound-wave.b.goit.study/api/feedbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) throw new Error('Error');

      alert('Thanks for the feedback!');
      closeModal();
    } catch (error) {
      alert('Error sending. Please try again later.');
      console.error(error);
    } finally {
      hideLoader();
    }
  });
})
