document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const form = document.querySelector('#quote-form');
  const note = document.querySelector('#form-note');
  if (form && note) {
    form.addEventListener('submit', event => {
      if (form.getAttribute('action') === '#') {
        event.preventDefault();
        note.textContent = 'The form is ready to connect to the existing Phelan email form technology.';
      }
    });
  }
});