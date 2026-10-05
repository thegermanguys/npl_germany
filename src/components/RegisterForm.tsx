"use client";

import { useActionState } from "react";
import { registerPlayer, type ActionState } from "@/app/actions/auth";
import { SAMPLE_SHARE_URL } from "@/lib/cricheroes";
import { CitySelect, ExperienceSelect, RoleSelect, TextField } from "./FormFields";

const initial: ActionState = {};

export function RegisterForm({ compact = false }: { compact?: boolean }) {
  const [state, action, pending] = useActionState(registerPlayer, initial);

  return (
    <form action={action} className={compact ? "" : "portal-form"}>
      {state.error ? <div className="form-msg err">{state.error}</div> : null}
      <div className="frow">
        <TextField
          id="fullName"
          name="fullName"
          label="Full name"
          placeholder="Your full name"
          required
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
          error={state.fieldErrors?.cricheroesUrl}
        />
      </div>
      <p className="field-hint stats-hint">If CricHeroes does not sync, add your card numbers.</p>
      <div className="frow frow-3">
        <TextField id="statsMatches" name="statsMatches" label="Matches" type="number" />
        <TextField id="statsRuns" name="statsRuns" label="Runs" type="number" />
        <TextField id="statsWickets" name="statsWickets" label="Wickets" type="number" />
      </div>
      <div className="check-row">
        <label>
          <input type="checkbox" name="nepaliCitizen" value="yes" required />
          I am a Nepali national
        </label>
        {state.fieldErrors?.nepaliCitizen ? (
          <span className="field-error">{state.fieldErrors.nepaliCitizen}</span>
        ) : null}
        <label>
          <input type="checkbox" name="germanyLegalResident" value="yes" required />
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
