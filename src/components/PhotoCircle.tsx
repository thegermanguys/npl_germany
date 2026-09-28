export function PhotoCircle({
  src,
  name,
  size = "md",
  fit = "cover",
}: {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  fit?: "cover" | "contain";
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  if (src) {
    const fitClass = fit === "contain" ? " photo-contain" : "";
    return <img className={`photo-circle photo-${size}${fitClass}`} src={src} alt={name} />;
  }
  return (
    <span className={`photo-circle photo-${size} photo-fallback`} aria-hidden="true">
      {initials || "?"}
    </span>
  );
}
