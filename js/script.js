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
