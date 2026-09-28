"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type MouseEvent,
} from "react";
import type { ActionState } from "@/app/actions/auth";
import { PhotoCircle } from "./PhotoCircle";

export function PhotoControl({
  action,
  name = "photo",
  title,
  lines = [],
  src,
  size = "lg",
  hidden,
  invite = "Add photo",
  showName = true,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  name?: "photo" | "logo";
  title: string;
  lines?: Array<string | null | undefined>;
  src?: string | null;
  size?: "md" | "lg";
  hidden?: Record<string, string>;
  invite?: string;
  showName?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [dragOver, setDragOver] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLFormElement>(null);
  const filled = Boolean(src);
  const metaLines = lines.filter((line): line is string => Boolean(line && line.trim()));

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function assignFile(file: File | undefined) {
    const input = inputRef.current;
    if (!input || !file) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    setOpen(false);
    input.form?.requestSubmit();
  }

  function onFileChange(event: FormEvent<HTMLInputElement>) {
    if (event.currentTarget.files?.length) {
      setOpen(false);
      event.currentTarget.form?.requestSubmit();
    }
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(true);
  }

  function onDragLeave() {
    setDragOver(false);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    assignFile(event.dataTransfer.files[0]);
  }

  function onReplace(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    inputRef.current?.click();
  }

  const overlay = pending ? "Saving…" : filled ? "Replace" : invite;
  const showOverlay = open || dragOver || pending;
  const classes = [
    "photo-control-circle",
    filled ? "has-photo" : "empty",
    dragOver ? "drag" : "",
    pending ? "pending" : "",
    open ? "open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <form action={formAction} className="photo-control" ref={rootRef}>
      {hidden
        ? Object.entries(hidden).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))
        : null}
      <div
        className={classes}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <button
          type="button"
          className="photo-control-hit"
          aria-expanded={open}
          aria-label={filled ? `${title} photo` : invite}
          disabled={pending}
          onClick={() => setOpen((value) => !value)}
        >
          <PhotoCircle src={src} name={title} size={size} />
        </button>
        {showOverlay ? (
          <button type="button" className="photo-control-overlay" disabled={pending} onClick={onReplace}>
            {overlay}
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp"
        className="sr-file"
        tabIndex={-1}
        disabled={pending}
        onChange={onFileChange}
      />
      {showName ? (
        <div className="photo-control-meta">
          <p className="photo-control-name">{title}</p>
          {metaLines.map((line) => (
            <p key={line} className="photo-control-line">
              {line}
            </p>
          ))}
          {state.error ? <div className="form-msg err">{state.error}</div> : null}
        </div>
      ) : state.error ? (
        <div className="form-msg err">{state.error}</div>
      ) : null}
    </form>
  );
}
