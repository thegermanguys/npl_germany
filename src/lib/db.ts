import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export class DbNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not set");
    this.name = "DbNotConfiguredError";
  }
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/** Runtime queries use the pooled Neon URL in DATABASE_URL. */
export function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new DbNotConfiguredError();
  return neon(url);
}

export function ballLabel(ballType: string): string {
  return ballType === "deuce" ? "Deuce ball" : ballType;
}
