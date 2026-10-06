"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/actions/auth";
import {
  addFranchise,
  inviteFranchiseStaff,
  inviteLeagueAdmin,
  removeFranchise,
  removeFranchiseOwner,
  removeFranchiseStaff,
  removeLeagueAdmin,
  saveFranchiseIdentity,
  setFranchiseOwnerAccount,
} from "@/app/actions/roles";
import { TextField } from "./FormFields";

type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

function HiddenFields({ fields }: { fields?: Record<string, string> }) {
  if (!fields) return null;
  return (
    <>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
    </>
  );
}

export function InvitePersonForm({
  actionFn,
  idPrefix,
  submitLabel,
  hidden,
}: {
  actionFn: FormAction;
  idPrefix: string;
  submitLabel: string;
  hidden?: Record<string, string>;
}) {
  const [state, action, pending] = useActionState(actionFn, {});

  return (
    <form action={action} className="portal-form">
      <HiddenFields fields={hidden} />
      {state.notice ? <div className="form-msg ok">{state.notice}</div> : null}
      {state.error ? <div className="form-msg err">{state.error}</div> : null}
      <div className="frow">
        <TextField
          id={`${idPrefix}-name`}
          name="displayName"
          label="Name"
          required
          error={state.fieldErrors?.displayName}
        />
        <TextField
          id={`${idPrefix}-email`}
          name="email"
          label="Email"
          type="email"
          required
          error={state.fieldErrors?.email}
        />
      </div>
      <div className="frow">
        <TextField
          id={`${idPrefix}-password`}
          name="password"
          label="Password"
          type="password"
          required
          error={state.fieldErrors?.password}
        />
      </div>
      <button type="submit" className="btn btn-navy btn-small" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

export function RemovePersonForm({
  actionFn,
  hidden,
  label,
}: {
  actionFn: FormAction;
  hidden: Record<string, string>;
  label: string;
}) {
  const [state, action, pending] = useActionState(actionFn, {});

  return (
    <form action={action} className="inline-form">
      <HiddenFields fields={hidden} />
      {state.error ? <div className="form-msg err">{state.error}</div> : null}
      <button type="submit" className="btn btn-navy btn-small" disabled={pending}>
        {pending ? "Saving…" : label}
      </button>
    </form>
  );
}

export function InviteLeagueAdminForm() {
  return <InvitePersonForm actionFn={inviteLeagueAdmin} idPrefix="league-admin" submitLabel="Invite" />;
}

export function RemoveLeagueAdminForm({ userId }: { userId: string }) {
  return <RemovePersonForm actionFn={removeLeagueAdmin} hidden={{ userId }} label="Remove" />;
}

export function AddFranchiseForm() {
  const [state, action, pending] = useActionState(addFranchise, {});

  return (
    <form action={action} className="portal-form">
      {state.notice ? <div className="form-msg ok">{state.notice}</div> : null}
      {state.error ? <div className="form-msg err">{state.error}</div> : null}
      <div className="frow">
        <TextField id="new-city" name="city" label="City" required error={state.fieldErrors?.city} />
        <TextField id="new-name" name="name" label="Name" required error={state.fieldErrors?.name} />
      </div>
      <div className="frow">
        <TextField
          id="new-tagline"
          name="tagline"
          label="Tagline"
          required
          full
          error={state.fieldErrors?.tagline}
        />
      </div>
      <div className="field full">
        <label htmlFor="new-description">Description</label>
        <textarea id="new-description" name="description" rows={3} required />
        {state.fieldErrors?.description ? <span className="field-error">{state.fieldErrors.description}</span> : null}
      </div>
      <button type="submit" className="btn btn-navy btn-small" disabled={pending}>
        {pending ? "Saving…" : "Add franchise"}
      </button>
    </form>
  );
}

export function FranchiseIdentityForm({
  franchiseId,
  city,
  name,
}: {
  franchiseId: string;
  city: string;
  name: string;
}) {
  const [state, action, pending] = useActionState(saveFranchiseIdentity, {});

  return (
    <form action={action} className="portal-form">
      <input type="hidden" name="franchiseId" value={franchiseId} />
      {state.notice ? <div className="form-msg ok">{state.notice}</div> : null}
      {state.error ? <div className="form-msg err">{state.error}</div> : null}
      <div className="frow">
        <TextField
          id={`city-${franchiseId}`}
          name="city"
          label="City"
          defaultValue={city}
          required
          error={state.fieldErrors?.city}
        />
        <TextField
          id={`name-${franchiseId}`}
          name="name"
          label="Name"
          defaultValue={name}
          required
          error={state.fieldErrors?.name}
        />
      </div>
      <button type="submit" className="btn btn-navy btn-small" disabled={pending}>
        {pending ? "Saving…" : "Save fields"}
      </button>
    </form>
  );
}

export function SetOwnerForm({ franchiseId }: { franchiseId: string }) {
  return (
    <InvitePersonForm
      actionFn={setFranchiseOwnerAccount}
      idPrefix={`owner-${franchiseId}`}
      submitLabel="Set owner"
      hidden={{ franchiseId }}
    />
  );
}

export function RemoveOwnerForm({ franchiseId }: { franchiseId: string }) {
  return <RemovePersonForm actionFn={removeFranchiseOwner} hidden={{ franchiseId }} label="Remove owner" />;
}

export function InviteStaffForm({ franchiseId }: { franchiseId: string }) {
  return (
    <InvitePersonForm
      actionFn={inviteFranchiseStaff}
      idPrefix={`staff-${franchiseId}`}
      submitLabel="Invite"
      hidden={{ franchiseId }}
    />
  );
}

export function RemoveStaffForm({ franchiseId, userId }: { franchiseId: string; userId: string }) {
  return (
    <RemovePersonForm actionFn={removeFranchiseStaff} hidden={{ franchiseId, userId }} label="Remove" />
  );
}

export function RemoveFranchiseForm({ franchiseId }: { franchiseId: string }) {
  return <RemovePersonForm actionFn={removeFranchise} hidden={{ franchiseId }} label="Remove franchise" />;
}
