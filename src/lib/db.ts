import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import postgres from "postgres";

export class DbNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not set");
    this.name = "DbNotConfiguredError";
  }
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function isLocalPostgres(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "127.0.0.1" || host === "localhost";
  } catch {
    return false;
  }
}

let localSql: ReturnType<typeof postgres> | undefined;

/** Runtime queries use the pooled Neon URL in DATABASE_URL. Localhost uses postgres.js. */
export function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new DbNotConfiguredError();
  if (isLocalPostgres(url)) {
    if (!localSql) localSql = postgres(url, { max: 1, onnotice() {} });
    return localSql as unknown as NeonQueryFunction<false, false>;
  }
  return neon(url);
}

export function ballLabel(ballType: string): string {
  return ballType === "deuce" ? "Deuce ball" : ballType;
}
