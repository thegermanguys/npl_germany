import type { FranchiseIconName } from "@/data/franchises";

export function FranchiseIcon({ icon }: { icon: FranchiseIconName }) {
  if (icon === "gorkhas") {
    return (
      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6">
        <path d="M4 20 L14 4 L20 20" strokeLinejoin="round" />
        <path d="M8 20 L14 10 L18 20" strokeLinejoin="round" />
      </svg>
    );
  }
  if (icon === "yetis") {
    return (
      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6">
        <ellipse cx="12" cy="8" rx="5" ry="4.5" />
        <path d="M8 18c0-2 1.5-3 4-3s4 1 4 3" strokeLinecap="round" />
        <path d="M9 6.5c.3-1 1.2-1 1.5 0M13.5 6.5c.3-1 1.2-1 1.5 0" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === "rhinos") {
    return (
      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6">
        <path d="M12 6c-4 1-8 3-8 3s3 1 8 1 8-1 8-1-4-2-8-3Z" />
        <path d="M12 10v9" />
      </svg>
    );
  }
  if (icon === "sherpas") {
    return (
      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6">
        <path d="M3 18 L9 8 L13 14 L16 9 L21 18Z" strokeLinejoin="round" />
      </svg>
    );
  }
  if (icon === "khukuris") {
    return (
      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6">
        <path d="M5 19 C9 14 13 9 19 5" strokeLinecap="round" />
        <path d="M15 5 L19 5 L19 9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6">
      <path d="M3 16 Q6 12 10 14 L14 9 L15 12 L20 10 L18 15 Q13 18 3 16Z" strokeLinejoin="round" />
    </svg>
  );
}
