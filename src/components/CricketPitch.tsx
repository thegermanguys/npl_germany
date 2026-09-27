export function CricketPitch({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      className={compact ? "cricket-pitch compact" : "cricket-pitch"}
      viewBox="0 0 360 260"
      role="img"
      aria-label="Cricket pitch with stumps and ball"
    >
      <ellipse cx="180" cy="132" rx="168" ry="108" fill="#16351C" />
      <ellipse cx="180" cy="132" rx="150" ry="94" fill="#1F4A28" />
      <rect x="132" y="38" width="96" height="184" rx="6" fill="#E6D7A8" />
      <rect x="144" y="50" width="72" height="160" fill="#F3E6B8" />
      <path d="M144 78h72M144 182h72" stroke="#C4B27A" strokeWidth="2" />
      <g stroke="#5A4A28" strokeWidth="3.2" strokeLinecap="round">
        <path d="M164 50v18M180 50v18M196 50v18" />
        <path d="M162 50h36" />
        <path d="M164 192v18M180 192v18M196 192v18" />
        <path d="M162 210h36" />
      </g>
      <circle cx="214" cy="128" r="11" fill="#C8102E" />
      <path
        d="M209 119.5c3 3.2 3 13.6 0 16.8M219 119.5c-3 3.2-3 13.6 0 16.8"
        stroke="#FAF6EE"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <g transform="translate(86 86) rotate(-28)">
        <rect x="0" y="8" width="10" height="54" rx="3" fill="#C48A3A" />
        <rect x="2" y="0" width="6" height="16" rx="2" fill="#8B5A2B" />
      </g>
    </svg>
  );
}
