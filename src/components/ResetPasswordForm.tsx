"use client";

import { useActionState } from "react";
import { completePasswordReset } from "@/app/actions/auth";
import { TextField } from "./FormFields";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(completePasswordReset, {});

  return (
    <form action={action} className="portal-form">
      <input type="hidden" name="token" value={token} />
      {state.error ? <div className="form-msg err">{state.error}</div> : null}
      <div className="frow">
        <TextField
          id="password"
          name="password"
          label="New password"
          type="password"
          required
          full
          error={state.fieldErrors?.password}
          autoComplete="new-password"
        />
      </div>
      <div className="frow">
        <TextField
          id="confirm"
          name="confirm"
          label="Confirm"
          type="password"
          required
          full
          error={state.fieldErrors?.confirm}
          autoComplete="new-password"
        />
      </div>
      <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={pending}>
        {pending ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}
