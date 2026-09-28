export const FRANCHISE_ICONS = [
  "gorkhas",
  "yetis",
  "rhinos",
  "sherpas",
  "khukuris",
  "garudas",
] as const;

export type FranchiseIconName = (typeof FRANCHISE_ICONS)[number];

export function franchiseIconFromSlug(slug: string): FranchiseIconName {
  const nick = slug.split("-").pop() ?? "";
  if ((FRANCHISE_ICONS as readonly string[]).includes(nick)) {
    return nick as FranchiseIconName;
  }
  return "gorkhas";
}

export function franchiseColorVar(colorKey: string): string {
  return `var(--${colorKey})`;
}
