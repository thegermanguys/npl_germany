/*
  PLAYER ROSTER DATA
  ------------------
  Add, edit, or remove players by editing the NPL_PLAYERS array below.
  This is the ONLY file you need to touch to update the roster shown
  on players.html.

  Each player is one { ... } entry. Copy an existing one, change the
  values, and add a comma between entries.

  Fields:
    name       - player's full name (text)
    franchise  - must exactly match one of:
                 "Frankfurt Gorkhas", "Munich Yetis", "Berlin Rhinos",
                 "Hamburg Sherpas", "Cologne Khukuris", "Stuttgart Garudas"
    role       - "Batter", "Bowler", "All-rounder", or "Wicketkeeper"
    city       - city the player is based in (text)
    photo      - path to a photo, e.g. "images/players/your-file.jpg"
                 (drop the image file into images/players/ first).
                 Leave as "images/players/avatar-placeholder.jpg" if you
                 don't have a photo yet.

  To remove the placeholder players below, just delete their entries
  (or the whole array content) and add real ones.
*/

window.NPL_PLAYERS = [
  { name: "Sample Player 1", franchise: "Frankfurt Gorkhas", role: "Batter", city: "Frankfurt", photo: "images/players/avatar-placeholder.jpg" },
  { name: "Sample Player 2", franchise: "Frankfurt Gorkhas", role: "Bowler", city: "Frankfurt", photo: "images/players/avatar-placeholder.jpg" },
  { name: "Sample Player 3", franchise: "Munich Yetis", role: "All-rounder", city: "Munich", photo: "images/players/avatar-placeholder.jpg" },
  { name: "Sample Player 4", franchise: "Munich Yetis", role: "Wicketkeeper", city: "Munich", photo: "images/players/avatar-placeholder.jpg" },
  { name: "Sample Player 5", franchise: "Berlin Rhinos", role: "Batter", city: "Berlin", photo: "images/players/avatar-placeholder.jpg" },
  { name: "Sample Player 6", franchise: "Hamburg Sherpas", role: "Bowler", city: "Hamburg", photo: "images/players/avatar-placeholder.jpg" },
  { name: "Sample Player 7", franchise: "Cologne Khukuris", role: "All-rounder", city: "Cologne", photo: "images/players/avatar-placeholder.jpg" },
  { name: "Sample Player 8", franchise: "Stuttgart Garudas", role: "Batter", city: "Stuttgart", photo: "images/players/avatar-placeholder.jpg" }
];
