export type FranchiseCopy = {
  slug: string;
  city: string;
  name: string;
  colorVar: string;
  tagline: string;
  description: string;
  icon: "gorkhas" | "yetis" | "rhinos" | "sherpas" | "khukuris" | "garudas";
};

export const FRANCHISE_COPY: FranchiseCopy[] = [
  {
    slug: "frankfurt-gorkhas",
    city: "Frankfurt",
    name: "Gorkhas",
    colorVar: "frankfurt",
    tagline: "The frontline never blinks.",
    description:
      "Named for the Gorkha soldier's reputation — fearless under pressure. Frankfurt hosts one of Germany's largest Nepali communities, built around its airport and finance-sector jobs.",
    icon: "gorkhas",
  },
  {
    slug: "munich-yetis",
    city: "Munich",
    name: "Yetis",
    colorVar: "munich",
    tagline: "Cold pitch, colder nerve.",
    description:
      "The mythical Himalayan yeti — rarely seen, hard to rattle. Munich's Nepali community has grown fast around its universities and engineering firms.",
    icon: "yetis",
  },
  {
    slug: "berlin-rhinos",
    city: "Berlin",
    name: "Rhinos",
    colorVar: "berlin",
    tagline: "Every catch, a rescue.",
    description:
      "The one-horned rhino of Chitwan — Nepal's national animal. Berlin's franchise draws from the capital's students, embassy families and young professionals.",
    icon: "rhinos",
  },
  {
    slug: "hamburg-sherpas",
    city: "Hamburg",
    name: "Sherpas",
    colorVar: "hamburg",
    tagline: "We carry the innings home.",
    description:
      "Named for the sherpas who carry others to the summit. Hamburg's port-city Nepali community anchors this franchise.",
    icon: "sherpas",
  },
  {
    slug: "cologne-khukuris",
    city: "Cologne",
    name: "Khukuris",
    colorVar: "cologne",
    tagline: "One clean swing decides it.",
    description:
      "The khukuri — Nepal's iconic curved blade, a symbol of decisive action. Cologne and the surrounding Rhineland hold a steadily growing Nepali base.",
    icon: "khukuris",
  },
  {
    slug: "stuttgart-garudas",
    city: "Stuttgart",
    name: "Garudas",
    colorVar: "stuttgart",
    tagline: "Hard to move, harder to stop.",
    description:
      "Garuda, the great mythical bird of Hindu and Nepali tradition. Stuttgart's automotive-sector Nepali workforce gives this franchise its steady, engineering-minded core.",
    icon: "garudas",
  },
];
