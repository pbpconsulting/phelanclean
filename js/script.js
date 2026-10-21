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

  const service = document.querySelector('#quote-service');
  if (service) {
    const conditionalFields = [
      { field: '#gutter-guards-field', input: '#gutter-guards', services: ['Gutter cleaning', 'Mix of services'] },
      { field: '#solar-panels-field', input: '#solar-panel-count', services: ['Solar cleaning', 'Mix of services'] }
    ];
    const updateServiceFields = () => {
      const noPanels = document.querySelector('#solar-panels-none');
      const panelCount = document.querySelector('#solar-panel-count');
      if (noPanels && panelCount) {
        const mixed = service.value === 'Mix of services';
        noPanels.hidden = !mixed;
        noPanels.disabled = !mixed;
        if (!mixed && panelCount.value === 'None') panelCount.value = '';
      }
      conditionalFields.forEach(config => {
        const field = document.querySelector(config.field);
        const input = document.querySelector(config.input);
        if (!field || !input) return;
        const relevant = config.services.includes(service.value);
        field.hidden = !relevant;
        input.disabled = !relevant;
        input.required = relevant;
        if (!relevant) input.value = '';
      });
    };
    service.addEventListener('change', updateServiceFields);
    window.addEventListener('pageshow', updateServiceFields);
    service.form.addEventListener('reset', () => setTimeout(updateServiceFields, 0));
    updateServiceFields();
  }

  const quoteForm = document.querySelector('#quote-form');
  if (quoteForm) {
    const validators = {
      name: value => value.length >= 2 && /\p{L}/u.test(value)
        ? '' : 'Please enter your name.',
      phone: value => {
        if (!/^[+\d\s().-]+$/.test(value)) return 'Please enter a valid phone number, including the area or country code.';
        const digits = value.replace(/\D/g, '');
        const australian = /^(?:0[23478]\d{8}|61[23478]\d{8}|1[38]00\d{6}|13\d{4})$/.test(digits);
        const international = /^\+(?!61)\d{8,15}$/.test(value.replace(/[\s().-]/g, ''));
        return australian || international ? '' : 'Please enter a valid phone number, e.g. 0481 090 675 or +61 481 090 675.';
      },
      email: value => /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(value)
        ? '' : 'Please enter a valid email address, e.g. name@example.com.',
      address: value => value.length >= 8 && /\p{L}/u.test(value) && /\S+\s+\S+/.test(value)
        ? '' : 'Please enter the property street address and suburb.'
    };
    const checks = Object.entries(validators).map(([name, validator]) => {
      const input = quoteForm.elements.namedItem(name);
      const error = document.createElement('span');
      error.id = `quote-${name}-error`;
      error.className = 'field-error';
      error.setAttribute('aria-live', 'polite');
      input.setAttribute('aria-describedby', error.id);
      input.after(error);
      let showError = false;
      const validate = () => {
        const message = validator(input.value.trim());
        input.setCustomValidity(message);
        if (showError) {
          error.textContent = message;
          input.setAttribute('aria-invalid', String(Boolean(message)));
        }
        return !message;
      };
      input.addEventListener('input', validate);
      input.addEventListener('blur', () => { showError = true; validate(); });
      input.addEventListener('invalid', () => { showError = true; validate(); });
      window.addEventListener('pageshow', validate);
      quoteForm.addEventListener('reset', () => {
        showError = false;
        error.textContent = '';
        input.removeAttribute('aria-invalid');
        setTimeout(validate, 0);
      });
      validate();
      return validate;
    });
    quoteForm.addEventListener('submit', event => {
      const valid = checks.map(validate => validate()).every(Boolean);
      if (!valid) {
        event.preventDefault();
        quoteForm.reportValidity();
      }
    });
  }

  const photos = document.querySelectorAll('main img');
  if (!photos.length) return;

  const viewer = document.createElement('dialog');
  viewer.className = 'photo-viewer';
  viewer.setAttribute('aria-label', 'Full-size photo');
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'photo-viewer-close';
  close.textContent = '×';
  close.setAttribute('aria-label', 'Close photo');
  close.autofocus = true;
  const fullPhoto = document.createElement('img');
  viewer.append(close, fullPhoto);
  document.body.append(viewer);

  let opener;
  const openPhoto = (photo, trigger) => {
    opener = trigger;
    fullPhoto.src = photo.currentSrc || photo.src;
    fullPhoto.alt = photo.alt;
    viewer.showModal();
    document.documentElement.classList.add('photo-viewer-open');
  };
  close.addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => {
    if (event.target === viewer) viewer.close();
  });
  viewer.addEventListener('close', () => {
    document.documentElement.classList.remove('photo-viewer-open');
    fullPhoto.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  });

  photos.forEach(photo => {
    // Hero copy and its gradient sit above the photo, so use a visible control.
    const hero = photo.closest('.hero, .page-hero');
    if (hero) {
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'hero-photo-trigger';
      trigger.textContent = 'View photo';
      trigger.setAttribute('aria-label', `View full-size photo: ${photo.alt}`);
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.addEventListener('click', () => openPhoto(photo, trigger));
      hero.append(trigger);
      const media = photo.parentElement;
      media.classList.add('photo-zoom');
      media.addEventListener('click', () => openPhoto(photo, trigger));
      return;
    }

    photo.classList.add('photo-zoom');
    photo.tabIndex = 0;
    photo.setAttribute('role', 'button');
    photo.setAttribute('aria-label', `View full-size photo: ${photo.alt}`);
    photo.setAttribute('aria-haspopup', 'dialog');
    photo.addEventListener('click', () => openPhoto(photo, photo));
    photo.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openPhoto(photo, photo);
      }
    });
  });
});
