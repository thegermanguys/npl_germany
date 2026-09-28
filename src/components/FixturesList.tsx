"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { franchiseColorVar } from "@/data/franchises";
import { fixtureMatchesFilter, formatFixtureTime, groupFixturesByDate } from "@/lib/fixtures";
import type { FixtureRow, FranchiseRow } from "@/lib/types";
import { FixtureStatusBadge } from "./FixtureStatusBadge";

export function FixturesList({
  fixtures,
  franchises,
}: {
  fixtures: FixtureRow[];
  franchises: FranchiseRow[];
}) {
  const [franchiseId, setFranchiseId] = useState("All");
  const [city, setCity] = useState("All");
  const cities = useMemo(() => [...new Set(fixtures.map((row) => row.city))], [fixtures]);

  const list = fixtures.filter((row) => fixtureMatchesFilter(row, franchiseId, city));
  const groups = groupFixturesByDate(list);

  return (
    <div>
      <div className="filter-row">
        <button
          type="button"
          className={`filter-chip${franchiseId === "All" ? " active" : ""}`}
          onClick={() => setFranchiseId("All")}
        >
          All clubs
        </button>
        {franchises.map((franchise) => (
          <button
            key={franchise.id}
            type="button"
            className={`filter-chip${franchiseId === franchise.id ? " active" : ""}`}
            onClick={() => setFranchiseId(franchise.id)}
          >
            {franchise.city}
          </button>
        ))}
        {cities.length > 0
          ? ["All", ...cities].map((name) => (
              <button
                key={`city-${name}`}
                type="button"
                className={`filter-chip${city === name ? " active" : ""}`}
                onClick={() => setCity(name)}
              >
                {name === "All" ? "All grounds" : name}
              </button>
            ))
          : null}
      </div>

      {groups.length === 0 ? (
        <div className="empty-note">
          {fixtures.length === 0 ? "No fixtures yet." : "No fixtures match those filters."}
        </div>
      ) : (
        groups.map((group) => (
          <div className="fixture-day" key={group.dateKey}>
            <h2>{group.label}</h2>
            <div className="fixture-list">
              {group.fixtures.map((fixture) => (
                <Link className="fixture-row" key={fixture.id} href={`/fixtures/${fixture.id}`}>
                  <div className="fixture-teams">
                    <span style={{ color: franchiseColorVar(fixture.a_color) }}>{fixture.a_short}</span>
                    <span className="muted">v</span>
                    <span style={{ color: franchiseColorVar(fixture.b_color) }}>{fixture.b_short}</span>
                  </div>
                  <div className="fixture-meta">
                    <span>{formatFixtureTime(fixture.scheduled_at)}</span>
                    <span className="muted">
                      {fixture.ground_name}, {fixture.city}
                    </span>
                    <FixtureStatusBadge status={fixture.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
