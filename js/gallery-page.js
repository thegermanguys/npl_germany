/*
  GALLERY PAGE SCRIPT
  --------------------
  Reads window.NPL_PHOTOS (set in data/photos.js) and renders the photo
  grid plus click-to-enlarge lightbox on gallery.html. You should not
  need to edit this file — update data/photos.js instead.
*/

(function () {
  const photos = window.NPL_PHOTOS || [];
  const grid = document.getElementById('gallery-grid');
  const emptyNote = document.getElementById('gallery-empty');
  if (!grid) return;

  if (photos.length === 0) {
    grid.style.display = 'none';
    emptyNote.style.display = 'block';
    return;
  }

  grid.innerHTML = photos.map((p, i) =>
    '<div class="g-item" data-index="' + i + '">' +
      '<img src="' + p.src + '" alt="' + (p.title || '') + '" loading="lazy">' +
      '<div class="g-cap">' +
        '<p class="g-title">' + (p.title || '') + '</p>' +
        '<p class="g-sub">' + (p.subtitle || '') + '</p>' +
      '</div>' +
    '</div>'
  ).join('');

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCap = document.getElementById('lightbox-cap');
  const lightboxClose = document.getElementById('lightbox-close');

  grid.querySelectorAll('.g-item').forEach(item => {
    item.addEventListener('click', () => {
      const i = parseInt(item.getAttribute('data-index'), 10);
      const p = photos[i];
      lightboxImg.src = p.src;
      lightboxImg.alt = p.title || '';
      lightboxCap.textContent = [p.title, p.subtitle].filter(Boolean).join(' — ');
      lightbox.classList.add('open');
    });
  });

  lightboxClose.addEventListener('click', () => lightbox.classList.remove('open'));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.classList.remove('open'); });
})();
