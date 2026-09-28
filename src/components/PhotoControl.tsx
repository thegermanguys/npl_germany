"use client";

import { useActionState, useRef, useState, type DragEvent, type FormEvent } from "react";
import type { ActionState } from "@/app/actions/auth";
import { PhotoCircle } from "./PhotoCircle";

export function PhotoControl({
  action,
  name = "photo",
  title,
  src,
  size = "lg",
  hidden,
  invite = "Add photo",
  showName = true,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  name?: "photo" | "logo";
  title: string;
  src?: string | null;
  size?: "md" | "lg";
  hidden?: Record<string, string>;
  invite?: string;
  showName?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const filled = Boolean(src);

  function assignFile(file: File | undefined) {
    const input = inputRef.current;
    if (!input || !file) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.form?.requestSubmit();
  }

  function onFileChange(event: FormEvent<HTMLInputElement>) {
    if (event.currentTarget.files?.length) event.currentTarget.form?.requestSubmit();
  }

  function onDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragOver(true);
  }

  function onDragLeave() {
    setDragOver(false);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragOver(false);
    assignFile(event.dataTransfer.files[0]);
  }

  const overlay = pending ? "Saving…" : filled ? "Replace" : invite;
  const classes = [
    "photo-control-circle",
    filled ? "has-photo" : "empty",
    dragOver ? "drag" : "",
    pending ? "pending" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <form action={formAction} className="photo-control">
      {hidden
        ? Object.entries(hidden).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))
        : null}
      <label
        className={classes}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <PhotoCircle src={src} name={title} size={size} />
        <span className="photo-control-overlay">{overlay}</span>
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/jpeg,image/png,image/webp"
          className="photo-control-input"
          disabled={pending}
          onChange={onFileChange}
        />
      </label>
      {showName ? (
        <div className="photo-control-meta">
          <p className="photo-control-name">{title}</p>
          {filled ? null : <p className="field-hint">{invite}. JPEG, PNG, or WebP. 2 MB.</p>}
          {state.error ? <div className="form-msg err">{state.error}</div> : null}
        </div>
      ) : state.error ? (
        <div className="form-msg err">{state.error}</div>
      ) : null}
    </form>
  );
}
