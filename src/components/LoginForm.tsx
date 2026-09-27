"use client";

import { useActionState } from "react";
import { loginUser, type ActionState } from "@/app/actions/auth";
import { TextField } from "./FormFields";

const initial: ActionState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginUser, initial);

  return (
    <form action={action} className="portal-form">
      {state.error ? <div className="form-msg err">{state.error}</div> : null}
      <div className="frow">
        <TextField
          id="email"
          name="email"
          label="Email"
          type="email"
          required
          full
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
          full
          error={state.fieldErrors?.password}
          autoComplete="current-password"
        />
      </div>
      <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
