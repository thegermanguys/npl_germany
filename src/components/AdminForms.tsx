"use client";

import { useActionState } from "react";
import {
  adminSetPassword,
  adminUpdateFranchise,
  adminUpdateSeason,
  createAccount,
} from "@/app/actions/admin";
import { SEASON_STATUSES, type FranchiseRow, type SeasonRow } from "@/lib/types";
import { TextField } from "./FormFields";

export function CreateAccountForm({ franchises }: { franchises: FranchiseRow[] }) {
  const [state, action, pending] = useActionState(createAccount, {});

  return (
    <form action={action} className="portal-form">
      {state.error ? <div className="form-msg err">{state.error}</div> : null}
      <div className="frow">
        <TextField
          id="displayName"
          name="displayName"
          label="Name"
          required
          error={state.fieldErrors?.displayName}
        />
        <TextField
          id="email"
          name="email"
          label="Email"
          type="email"
          required
          error={state.fieldErrors?.email}
        />
      </div>
      <div className="frow">
        <TextField
          id="password"
          name="password"
          label="Password"
          type="password"
          required
          error={state.fieldErrors?.password}
        />
        <div className="field">
          <label htmlFor="role">Role</label>
          <select id="role" name="role" defaultValue="franchise_owner" required>
            <option value="franchise_owner">Franchise owner</option>
            <option value="player">Player</option>
          </select>
          {state.fieldErrors?.role ? <span className="field-error">{state.fieldErrors.role}</span> : null}
        </div>
      </div>
      <div className="frow">
        <div className="field full">
          <label htmlFor="franchiseId">Franchise (owners)</label>
          <select id="franchiseId" name="franchiseId" defaultValue="">
            <option value="">None</option>
            {franchises.map((franchise) => (
              <option key={franchise.id} value={franchise.id}>
                {franchise.full_name}
              </option>
            ))}
          </select>
          {state.fieldErrors?.franchiseId ? (
            <span className="field-error">{state.fieldErrors.franchiseId}</span>
          ) : null}
        </div>
      </div>
      <button type="submit" className="btn btn-navy" disabled={pending}>
        {pending ? "Saving…" : "Create account"}
      </button>
    </form>
  );
}

export function SeasonForm({ season }: { season: SeasonRow }) {
  const [state, action, pending] = useActionState(adminUpdateSeason, {});

  return (
    <form action={action} className="portal-form">
      <input type="hidden" name="seasonId" value={season.id} />
      {state.error ? <div className="form-msg err">{state.error}</div> : null}
      <div className="frow">
        <TextField id="name" name="name" label="Name" defaultValue={season.name} required />
        <TextField id="year" name="year" label="Year" type="number" defaultValue={String(season.year)} required />
      </div>
      <div className="frow">
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={season.status}>
            {SEASON_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Ball</label>
          <input value="Deuce ball" readOnly />
        </div>
      </div>
      <button type="submit" className="btn btn-navy" disabled={pending}>
        {pending ? "Saving…" : "Save season"}
      </button>
    </form>
  );
}

export function FranchiseEditForm({ franchise }: { franchise: FranchiseRow }) {
  const [state, action, pending] = useActionState(adminUpdateFranchise, {});

  return (
    <form action={action} className="portal-form franchise-edit">
      <input type="hidden" name="franchiseId" value={franchise.id} />
      {state.error ? <div className="form-msg err">{state.error}</div> : null}
      <h3>
        {franchise.city} {franchise.name}
      </h3>
      <div className="frow">
        <TextField
          id={`tagline-${franchise.id}`}
          name="tagline"
          label="Tagline"
          defaultValue={franchise.tagline}
          required
          full
        />
      </div>
      <div className="field full">
        <label htmlFor={`description-${franchise.id}`}>Description</label>
        <textarea
          id={`description-${franchise.id}`}
          name="description"
          defaultValue={franchise.description}
          rows={3}
          required
        />
      </div>
      <div className="frow">
        <TextField
          id={`purseTotal-${franchise.id}`}
          name="purseTotal"
          label="Purse cap (€)"
          type="number"
          defaultValue={String(franchise.purse_total)}
          required
        />
        <div className="field">
          <label>Spent</label>
          <input value={`€${franchise.purse_spent}`} readOnly />
        </div>
      </div>
      <button type="submit" className="btn btn-navy btn-small" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

export function AdminSetPasswordForm({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(adminSetPassword, {});

  return (
    <form action={action} className="admin-set-password">
      <input type="hidden" name="userId" value={userId} />
      {state.notice ? <div className="muted">{state.notice}</div> : null}
      {state.error ? <div className="form-msg err">{state.error}</div> : null}
      <label>
        New password
        <input type="password" name="password" autoComplete="new-password" required minLength={8} />
      </label>
      <button type="submit" className="btn btn-navy btn-small" disabled={pending}>
        {pending ? "Saving…" : "Set"}
      </button>
    </form>
  );
}
