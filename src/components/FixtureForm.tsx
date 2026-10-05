"use client";

import { useActionState } from "react";
import { adminCreateFixture, adminUpdateFixture } from "@/app/actions/fixtures";
import { DEFAULT_FIXTURE_SEASON, FIXTURE_STATUSES, fixtureStatusLabel, toDatetimeLocalValue } from "@/lib/fixtures";
import type { FixtureRow, FranchiseRow } from "@/lib/types";
import { TextField } from "./FormFields";

export function FixtureForm({
  franchises,
  fixture,
}: {
  franchises: FranchiseRow[];
  fixture?: FixtureRow;
}) {
  const action = fixture ? adminUpdateFixture : adminCreateFixture;
  const [state, formAction, pending] = useActionState(action, {});
  const cities = [...new Set(franchises.map((row) => row.city))];

  return (
    <form action={formAction} className="portal-form">
      {fixture ? <input type="hidden" name="fixtureId" value={fixture.id} /> : null}
      <input type="hidden" name="season" value={fixture?.season ?? DEFAULT_FIXTURE_SEASON} />
      {state.error ? <div className="form-msg err">{state.error}</div> : null}
      <div className="frow">
        <div className="field">
          <label htmlFor={fixture ? "franchiseAId-edit" : "franchiseAId"}>Home</label>
          <select
            id={fixture ? "franchiseAId-edit" : "franchiseAId"}
            name="franchiseAId"
            required
            defaultValue={fixture?.franchise_a_id ?? ""}
          >
            <option value="">Choose</option>
            {franchises.map((row) => (
              <option key={row.id} value={row.id}>
                {row.full_name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={fixture ? "franchiseBId-edit" : "franchiseBId"}>Away</label>
          <select
            id={fixture ? "franchiseBId-edit" : "franchiseBId"}
            name="franchiseBId"
            required
            defaultValue={fixture?.franchise_b_id ?? ""}
          >
            <option value="">Choose</option>
            {franchises.map((row) => (
              <option key={`b-${row.id}`} value={row.id}>
                {row.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="frow">
        <TextField
          id={fixture ? "groundName-edit" : "groundName"}
          name="groundName"
          label="Ground"
          defaultValue={fixture?.ground_name}
          required
        />
        <div className="field">
          <label htmlFor={fixture ? "city-edit" : "city"}>City</label>
          <input
            id={fixture ? "city-edit" : "city"}
            name="city"
            list={fixture ? "fixture-cities-edit" : "fixture-cities"}
            defaultValue={fixture?.city}
            required
          />
          <datalist id={fixture ? "fixture-cities-edit" : "fixture-cities"}>
            {cities.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
      </div>
      <div className="frow">
        <TextField
          id={fixture ? "scheduledAt-edit" : "scheduledAt"}
          name="scheduledAt"
          label="Date and time"
          type="datetime-local"
          defaultValue={fixture ? toDatetimeLocalValue(fixture.scheduled_at) : undefined}
          required
        />
        <div className="field">
          <label htmlFor={fixture ? "status-edit" : "status"}>Status</label>
          <select
            id={fixture ? "status-edit" : "status"}
            name="status"
            defaultValue={fixture?.status ?? "scheduled"}
          >
            {FIXTURE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {fixtureStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="muted">Times are Europe/Berlin. Season 1.</p>
      <button type="submit" className="btn btn-navy" disabled={pending}>
        {pending ? "Saving…" : fixture ? "Save fixture" : "Add fixture"}
      </button>
    </form>
  );
}
