
  const burgerBtn = document.querySelector('.header-burger-btn');
  const mobileMenu = document.querySelector('.header-mobile-menu');
  const closeBtn = document.querySelector('.header-modile-menu-close');

  // Відкрити меню
  burgerBtn.addEventListener('click', () => {
    mobileMenu.classList.add('is-open');
  });

  // Закрити меню
  closeBtn.addEventListener('click', () => {
    mobileMenu.classList.remove('is-open');
  });

  // Закрити меню - клік на лінк
  const mobileLinks = document.querySelectorAll('.mobile-menu-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
    });
  });

