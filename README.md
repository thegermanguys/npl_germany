# NPL Germany website

Plain HTML/CSS/JS, no build step, no server required. Open `index.html`
in a browser to preview locally.

## File structure

```
index.html              Home page (hero, about, franchises, format, join form)
players.html            Player roster page (reads data/players.js)
gallery.html            Tournament photo gallery (reads data/photos.js)

css/style.css           All styles for every page — edit colors, fonts, spacing here

js/main.js              Registration form + founder dashboard (shared, every page)
js/players-page.js      Renders the roster grid on players.html
js/gallery-page.js      Renders the photo grid + lightbox on gallery.html

data/players.js         <-- EDIT THIS to add/update/remove players
data/photos.js          <-- EDIT THIS to add/update/remove tournament photos

images/players/         Player photos go here (avatar-placeholder.jpg is the default)
images/photos/          Tournament photos go here (6 placeholder images included)
```

## The two files you'll touch most often

**`data/players.js`** — one entry per player: name, franchise, role, city, and
a path to their photo. Full instructions are in the comments at the top of
the file. No other file needs to change when you update the roster.

**`data/photos.js`** — one entry per photo: file path, title, subtitle.
Drop real photos into `images/photos/` and point entries at them to replace
the six "photo coming soon" placeholders. Full instructions are in the
comments at the top of the file.

## Editing the design

Everything visual — colors, fonts, spacing, card layout — lives in
`css/style.css`. The color variables are at the very top of the file:

```css
--crimson:#C8102E;   /* primary red */
--navy:#0A1F3D;      /* primary dark blue */
--gold:#F0A93A;      /* accent gold */
```

Change a value there and it updates everywhere on the site.

## The registration form — read before you go live

This is a static site with no backend, so there's no built-in way to collect
form submissions in one place. Right now, submitting the form on the home
page opens the visitor's email app with their details pre-filled (a
`mailto:` link) — that works anywhere, but the visitor has to hit send
themselves.

When you're ready for a smoother signup flow, replace that with a real form
backend. Two easy options that need no custom backend of your own:

- **Netlify Forms** — if you host on Netlify, add `netlify` as an attribute
  on the `<form id="interest-form">` tag in `index.html` and it just works.
- **Formspree** (formspree.io) — free tier available; point the form's
  `action` at the endpoint they give you.

The `window.storage` calls you'll see in `js/main.js` (used by the "Founder
dashboard" link in the footer) only work while this site is being previewed
inside Claude — they do nothing once you host the site yourself. That's
expected, not a bug.

## Hosting

Any static host works: GitHub Pages, Netlify, Vercel, or your own web
server. Upload the whole folder (keeping the file structure above intact)
and point your domain at `index.html`.

## Before you make this public

- Replace `hello@nplgermany.de` (used as the placeholder contact email in
  `index.html` and `js/main.js`) with your real contact address.
- Change the founder dashboard passcode (`NPL2026`, in `js/main.js`) if
  you're going to keep using the dashboard feature seriously — it's a very
  light deterrent, not real security.
- Swap in real players and photos once you have them.
