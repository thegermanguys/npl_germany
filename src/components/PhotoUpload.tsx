"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/actions/auth";

export function PhotoUpload({
  action,
  name = "photo",
  label,
  hidden,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  name?: "photo" | "logo";
  label: string;
  hidden?: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="photo-upload">
      {hidden
        ? Object.entries(hidden).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))
        : null}
      {state.error ? <div className="form-msg err">{state.error}</div> : null}
      <label>
        {label}
        <input type="file" name={name} accept="image/jpeg,image/png,image/webp" required />
      </label>
      <p className="field-hint">JPEG, PNG, or WebP. 2 MB.</p>
      <button type="submit" className="btn btn-navy btn-small" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
