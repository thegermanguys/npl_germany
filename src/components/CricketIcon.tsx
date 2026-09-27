export type CricketMark = "bat" | "ball" | "stumps" | "league";

export function CricketIcon({
  name,
  className = "cricket-icon",
}: {
  name: CricketMark;
  className?: string;
}) {
  if (name === "ball") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M8 5.8c2.2 2.4 2.2 10 0 12.4M16 5.8c-2.2 2.4-2.2 10 0 12.4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (name === "bat") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7.2 20.2 16.4 5.4c.4-.6 1.2-.8 1.8-.4l.6.4c.6.4.8 1.2.4 1.8L10 21.2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M6.4 19.2c-1.2.8-2.4 1.6-2.6 2.2.6.2 1.6-.8 2.6-2.2Z" fill="currentColor" />
        <path d="M15.6 6.6 18 8.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "stumps") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 21V8.5M12 21V8.5M17 21V8.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M6 8.2h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M8.2 6.6 10.4 8.2M13.6 6.6 15.8 8.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <path
        d="M8.2 6.4c2.6 2.6 2.6 8.6 0 11.2M15.8 6.4c-2.6 2.6-2.6 8.6 0 11.2"
        stroke="#FAF6EE"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M8.6 16.4V7.6h2.1l2.6 5.6 2.6-5.6h2.1v8.8h-1.8V10.2l-2.5 5.3h-1.1L10.4 10.2v6.2H8.6Z"
        fill="#FAF6EE"
      />
    </svg>
  );
}

export function CricketMarks({ className = "" }: { className?: string }) {
  return (
    <div className={`cricket-marks ${className}`.trim()} aria-hidden="true">
      <CricketIcon name="bat" />
      <CricketIcon name="ball" />
      <CricketIcon name="stumps" />
      <CricketIcon name="league" />
    </div>
  );
}
