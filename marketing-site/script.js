document.addEventListener('DOMContentLoaded', () => {
  const yearNode = document.getElementById('year');
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('is-open');
    });
  }

  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = contactForm.querySelector('input[name="name"]').value.trim();
      const email = contactForm.querySelector('input[name="email"]').value.trim();
      const subject = contactForm.querySelector('input[name="subject"]').value.trim();
      const message = contactForm.querySelector('textarea[name="message"]').value.trim();

      if (!name || !email || !subject || !message) {
        formStatus.textContent = 'Please complete all required fields before sending your message.';
        formStatus.style.color = '#fbbf24';
        return;
      }

      formStatus.textContent = `Thanks ${name}! Your message has been noted. We will contact you soon.`;
      formStatus.style.color = '#9ef2d7';
      contactForm.reset();
    });
  }
});
