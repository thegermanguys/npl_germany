"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import { TextField } from "./FormFields";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, {});

  return (
    <form action={action} className="portal-form">
      {state.notice ? <div className="form-msg ok">{state.notice}</div> : null}
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
      <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
