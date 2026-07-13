/*
  PLAYERS PAGE SCRIPT
  --------------------
  Reads window.NPL_PLAYERS (set in data/players.js) and renders the
  filter chips + player card grid on players.html. You should not need
  to edit this file — update data/players.js instead.
*/

(function () {
  const FRANCHISE_COLOR = {
    'Frankfurt Gorkhas': 'var(--frankfurt)',
    'Munich Yetis': 'var(--munich)',
    'Berlin Rhinos': 'var(--berlin)',
    'Hamburg Sherpas': 'var(--hamburg)',
    'Cologne Khukuris': 'var(--cologne)',
    'Stuttgart Garudas': 'var(--stuttgart)'
  };

  const players = window.NPL_PLAYERS || [];
  const grid = document.getElementById('players-grid');
  const filterRow = document.getElementById('filter-row');
  const emptyNote = document.getElementById('players-empty');
  if (!grid) return;

  const franchises = Object.keys(FRANCHISE_COLOR);
  let activeFilter = 'All';

  function renderChips() {
    const chips = ['All'].concat(franchises);
    filterRow.innerHTML = chips.map(name =>
      '<button class="filter-chip' + (name === activeFilter ? ' active' : '') + '" data-filter="' + name + '">' + name + '</button>'
    ).join('');

    filterRow.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.getAttribute('data-filter');
        renderChips();
        renderGrid();
      });
    });
  }

  function renderGrid() {
    const list = activeFilter === 'All' ? players : players.filter(p => p.franchise === activeFilter);

    if (list.length === 0) {
      grid.style.display = 'none';
      emptyNote.style.display = 'block';
      emptyNote.textContent = players.length === 0
        ? 'No players added yet. Add entries to data/players.js to populate this page.'
        : 'No players found for this franchise yet.';
      return;
    }

    grid.style.display = 'grid';
    emptyNote.style.display = 'none';
    grid.innerHTML = list.map(p => {
      const color = FRANCHISE_COLOR[p.franchise] || 'var(--muted)';
      const photo = p.photo || 'images/players/avatar-placeholder.jpg';
      return (
        '<div class="player-card">' +
          '<img class="photo" src="' + photo + '" alt="' + p.name + '" onerror="this.src=\'images/players/avatar-placeholder.jpg\'">' +
          '<div class="info">' +
            '<p class="p-name">' + p.name + '</p>' +
            '<p class="p-role">' + p.role + ' &middot; ' + p.city + '</p>' +
            '<span class="p-badge" style="background:' + color + ';">' + p.franchise + '</span>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  renderChips();
  renderGrid();
})();
