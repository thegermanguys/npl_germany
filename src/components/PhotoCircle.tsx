export function PhotoCircle({
  src,
  name,
  size = "md",
}: {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  if (src) {
    return <img className={`photo-circle photo-${size}`} src={src} alt={name} />;
  }
  return (
    <span className={`photo-circle photo-${size} photo-fallback`} aria-hidden="true">
      {initials || "?"}
    </span>
  );
}
