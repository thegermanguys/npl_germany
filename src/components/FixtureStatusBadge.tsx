import { fixtureStatusLabel, type FixtureStatus } from "@/lib/fixtures";

export function FixtureStatusBadge({ status }: { status: FixtureStatus }) {
  return <span className={`elig-badge fixture-${status}`}>{fixtureStatusLabel(status)}</span>;
}
