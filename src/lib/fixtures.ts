import {
  DEFAULT_FIXTURE_SEASON,
  FIXTURE_STATUSES,
  type FixtureRow,
  type FixtureStatus,
} from "./types.ts";

export { DEFAULT_FIXTURE_SEASON, FIXTURE_STATUSES, type FixtureStatus };

export const LEAGUE_TIME_ZONE = "Europe/Berlin";

export function isFixtureStatus(value: string): value is FixtureStatus {
  return (FIXTURE_STATUSES as readonly string[]).includes(value);
}

export function fixtureStatusLabel(status: FixtureStatus): string {
  if (status === "scheduled") return "Scheduled";
  if (status === "live") return "Live";
  if (status === "completed") return "Completed";
  return "Abandoned";
}

function berlinParts(date: Date): {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
} {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: LEAGUE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
  };
}

export function berlinOffsetMinutes(date: Date): number {
  const name =
    new Intl.DateTimeFormat("en-GB", {
      timeZone: LEAGUE_TIME_ZONE,
      timeZoneName: "longOffset",
    })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? "";
  const match = name.match(/([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return 60;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0));
}

export function parseDatetimeLocal(value: string): Date | null {
  const match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;

  let utcMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  for (let i = 0; i < 2; i += 1) {
    const offset = berlinOffsetMinutes(new Date(utcMs));
    utcMs = Date.UTC(year, month - 1, day, hour, minute, 0) - offset * 60_000;
  }
  const check = berlinParts(new Date(utcMs));
  const pad = (n: number) => String(n).padStart(2, "0");
  if (
    check.year !== String(year) ||
    check.month !== pad(month) ||
    check.day !== pad(day) ||
    check.hour !== pad(hour) ||
    check.minute !== pad(minute)
  ) {
    return null;
  }
  return new Date(utcMs);
}

export function toDatetimeLocalValue(iso: string): string {
  const parts = berlinParts(new Date(iso));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function fixtureDateKey(iso: string): string {
  const parts = berlinParts(new Date(iso));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatFixtureDay(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: LEAGUE_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatFixtureTime(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: LEAGUE_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatFixtureWhen(iso: string): string {
  return `${formatFixtureDay(iso)} · ${formatFixtureTime(iso)}`;
}

export function groupFixturesByDate(fixtures: FixtureRow[]): Array<{
  dateKey: string;
  label: string;
  fixtures: FixtureRow[];
}> {
  const groups: Array<{ dateKey: string; label: string; fixtures: FixtureRow[] }> = [];
  for (const fixture of fixtures) {
    const dateKey = fixtureDateKey(fixture.scheduled_at);
    const last = groups[groups.length - 1];
    if (last && last.dateKey === dateKey) {
      last.fixtures.push(fixture);
    } else {
      groups.push({ dateKey, label: formatFixtureDay(fixture.scheduled_at), fixtures: [fixture] });
    }
  }
  return groups;
}

export function fixtureMatchesFilter(
  fixture: FixtureRow,
  franchiseId: string,
  city: string,
): boolean {
  if (franchiseId !== "All") {
    if (fixture.franchise_a_id !== franchiseId && fixture.franchise_b_id !== franchiseId) {
      return false;
    }
  }
  if (city !== "All" && fixture.city !== city) return false;
  return true;
}
