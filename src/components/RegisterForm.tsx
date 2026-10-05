"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { registerPlayer, type ActionState } from "@/app/actions/auth";
import { SAMPLE_SHARE_URL } from "@/lib/cricheroes";
import { CitySelect, ExperienceSelect, RoleSelect, TextField } from "./FormFields";

const initial: ActionState = {};

type Draft = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  playingRole: string;
  experience: string;
  cricheroesUrl: string;
  statsMatches: string;
  statsRuns: string;
  statsWickets: string;
  nepaliCitizen: boolean;
  germanyLegalResident: boolean;
};

const emptyDraft: Draft = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  playingRole: "",
  experience: "",
  cricheroesUrl: "",
  statsMatches: "",
  statsRuns: "",
  statsWickets: "",
  nepaliCitizen: false,
  germanyLegalResident: false,
};

export function RegisterForm({ compact = false }: { compact?: boolean }) {
  const [state, action, pending] = useActionState(registerPlayer, initial);
  const [draft, setDraft] = useState(emptyDraft);
  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => {
      action(data);
    });
  }

  return (
    <form className={compact ? "" : "portal-form"} onSubmit={onSubmit}>
      {state.error ? <div className="form-msg err">{state.error}</div> : null}
      <div className="frow">
        <TextField
          id="fullName"
          name="fullName"
          label="Full name"
          placeholder="Your full name"
          required
          value={draft.fullName}
          onChange={(event) => set("fullName", event.target.value)}
          error={state.fieldErrors?.fullName}
          autoComplete="name"
        />
        <TextField
          id="email"
          name="email"
          label="Email"
          type="email"
          placeholder="name@email.com"
          required
          value={draft.email}
          onChange={(event) => set("email", event.target.value)}
          error={state.fieldErrors?.email}
          autoComplete="email"
        />
      </div>
      <div className="frow">
        <TextField
          id="password"
          name="password"
          label="Password"
          type="password"
          required
          value={draft.password}
          onChange={(event) => set("password", event.target.value)}
          error={state.fieldErrors?.password}
          autoComplete="new-password"
        />
        <TextField
          id="phone"
          name="phone"
          label="Phone"
          type="tel"
          placeholder="+49 …"
          required
          value={draft.phone}
          onChange={(event) => set("phone", event.target.value)}
          error={state.fieldErrors?.phone}
          autoComplete="tel"
        />
      </div>
      <div className="frow">
        <CitySelect
          id="city"
          name="city"
          label="City in Germany"
          required
          error={state.fieldErrors?.city}
        />
        <RoleSelect
          id="playingRole"
          name="playingRole"
          label="Playing role"
          required
          value={draft.playingRole}
          onChange={(event) => set("playingRole", event.target.value)}
          error={state.fieldErrors?.playingRole}
        />
      </div>
      <div className="frow">
        <ExperienceSelect
          id="experience"
          name="experience"
          label="Experience"
          required
          full
          value={draft.experience}
          onChange={(event) => set("experience", event.target.value)}
          error={state.fieldErrors?.experience}
        />
      </div>
      <div className="frow">
        <TextField
          id="cricheroesUrl"
          name="cricheroesUrl"
          label="CricHeroes profile"
          placeholder={SAMPLE_SHARE_URL}
          required
          full
          value={draft.cricheroesUrl}
          onChange={(event) => set("cricheroesUrl", event.target.value)}
          error={state.fieldErrors?.cricheroesUrl}
        />
      </div>
      <p className="field-hint stats-hint">If CricHeroes does not sync, add your card numbers.</p>
      <div className="frow frow-3">
        <TextField
          id="statsMatches"
          name="statsMatches"
          label="Matches"
          type="number"
          value={draft.statsMatches}
          onChange={(event) => set("statsMatches", event.target.value)}
        />
        <TextField
          id="statsRuns"
          name="statsRuns"
          label="Runs"
          type="number"
          value={draft.statsRuns}
          onChange={(event) => set("statsRuns", event.target.value)}
        />
        <TextField
          id="statsWickets"
          name="statsWickets"
          label="Wickets"
          type="number"
          value={draft.statsWickets}
          onChange={(event) => set("statsWickets", event.target.value)}
        />
      </div>
      <div className="check-row">
        <label>
          <input
            type="checkbox"
            name="nepaliCitizen"
            value="yes"
            checked={draft.nepaliCitizen}
            onChange={(event) => set("nepaliCitizen", event.target.checked)}
            required
          />
          I am a Nepali national
        </label>
        {state.fieldErrors?.nepaliCitizen ? (
          <span className="field-error">{state.fieldErrors.nepaliCitizen}</span>
        ) : null}
        <label>
          <input
            type="checkbox"
            name="germanyLegalResident"
            value="yes"
            checked={draft.germanyLegalResident}
            onChange={(event) => set("germanyLegalResident", event.target.checked)}
            required
          />
          I have legal status and live in Germany
        </label>
        {state.fieldErrors?.germanyLegalResident ? (
          <span className="field-error">{state.fieldErrors.germanyLegalResident}</span>
        ) : null}
      </div>
      <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={pending}>
        {pending ? "Saving…" : "Register to play"}
      </button>
    </form>
  );
}
