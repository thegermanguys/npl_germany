/*
  MAIN SITE SCRIPT
  ----------------
  Shared behaviour used across pages: the interest-registration form
  (index.html) and the founder dashboard (all pages, via the footer
  link). Player and photo rendering live in their own page-specific
  scripts (js/players-page.js and js/gallery-page.js) so this file
  doesn't need to change when you update rosters or photos.

  IMPORTANT — read this if you're hosting the site yourself:
  This is a static site with no server, so there is no built-in way to
  collect form submissions in one place. The registration form below
  falls back to opening the visitor's email app with their details
  pre-filled (a "mailto" link) — that works on any host, no backend
  required, but it does mean the visitor has to hit send themselves.

  For a real, no-effort-from-visitor signup flow once you're live,
  swap the TODO section below for a form backend such as:
    - Netlify Forms (if you host on Netlify — just add a `netlify`
      attribute to the <form> tag and it works with no JS changes)
    - Formspree (https://formspree.io) — point the form's action at
      the endpoint they give you
    - A Google Form embedded or linked instead

  While you're previewing this inside Claude, submissions are also
  saved with window.storage so you can see them via the founder
  dashboard link in the footer — that part only works inside Claude's
  preview, not on a real host.
*/

// ---- Registration form (only present on index.html) ----
(function () {
  const form = document.getElementById('interest-form');
  if (!form) return;

  const msgOk = document.getElementById('msg-ok');
  const msgErr = document.getElementById('msg-err');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgOk.style.display = 'none';
    msgErr.style.display = 'none';

    const entry = {
      name: document.getElementById('f-name').value.trim(),
      email: document.getElementById('f-email').value.trim(),
      city: document.getElementById('f-city').value,
      role: document.getElementById('f-role').value,
      experience: document.getElementById('f-exp').value,
      ts: Date.now()
    };

    // Opportunistic: only works while previewing inside Claude.
    // Safe to leave in even after you self-host — it just quietly does nothing there.
    try {
      if (window.storage && typeof window.storage.set === 'function') {
        const key = 'interest:' + entry.ts + ':' + Math.random().toString(36).slice(2, 8);
        await window.storage.set(key, JSON.stringify(entry), true);
      }
    } catch (err) {
      // ignore — fall through to the mailto handoff below regardless
    }

    // TODO: replace this block with your real form backend once you
    // have one (see the note at the top of this file). Until then,
    // this opens the visitor's email app with their details ready to send.
    try {
      const subject = encodeURIComponent('NPL Germany — interest registration: ' + entry.name);
      const body = encodeURIComponent(
        'Name: ' + entry.name + '\n' +
        'Email: ' + entry.email + '\n' +
        'City: ' + entry.city + '\n' +
        'Playing role: ' + entry.role + '\n' +
        'Experience: ' + entry.experience
      );
      window.location.href = 'mailto:hello@nplgermany.de?subject=' + subject + '&body=' + body;
      msgOk.style.display = 'block';
      form.reset();
    } catch (err) {
      msgErr.style.display = 'block';
    }
  });
})();

// ---- Founder dashboard (footer link, present on every page) ----
// Only works while previewing inside Claude — see note above. On a
// self-hosted copy this will just show "Could not load entries."
(function () {
  const link = document.getElementById('founder-link');
  if (!link) return;

  const dashOverlay = document.getElementById('dash-overlay');
  const dashBody = document.getElementById('dash-body');
  const dashSub = document.getElementById('dash-sub');

  link.addEventListener('click', async () => {
    const code = prompt('Founder passcode');
    if (code !== 'NPL2026') return;
    dashOverlay.classList.add('open');
    dashSub.textContent = 'Loading entries…';
    dashBody.innerHTML = '';
    try {
      if (!window.storage || typeof window.storage.list !== 'function') {
        dashSub.textContent = 'Dashboard only works while previewing inside Claude.';
        return;
      }
      const list = await window.storage.list('interest:', true);
      const keys = (list && list.keys) ? list.keys : [];
      const rows = [];
      for (const k of keys) {
        try {
          const item = await window.storage.get(k, true);
          if (item && item.value) rows.push(JSON.parse(item.value));
        } catch (e) {}
      }
      rows.sort((a, b) => b.ts - a.ts);
      dashSub.textContent = rows.length + ' player' + (rows.length === 1 ? '' : 's') + ' registered so far.';
      dashBody.innerHTML = rows.map(r =>
        '<tr><td>' + (r.name || '') + '</td><td>' + (r.city || '') + '</td><td>' + (r.role || '') + '</td><td>' + (r.experience || '') + '</td><td>' + (r.email || '') + '</td></tr>'
      ).join('');
    } catch (e) {
      dashSub.textContent = 'Could not load entries.';
    }
  });

  const closeBtn = document.getElementById('dash-close');
  if (closeBtn) closeBtn.addEventListener('click', () => dashOverlay.classList.remove('open'));
  dashOverlay.addEventListener('click', (e) => { if (e.target === dashOverlay) dashOverlay.classList.remove('open'); });
})();
