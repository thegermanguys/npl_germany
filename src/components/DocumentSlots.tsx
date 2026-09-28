"use client";

import { useActionState, useRef, type FormEvent } from "react";
import type { ActionState } from "@/app/actions/auth";
import {
  DOCUMENT_SLOTS,
  documentIdForSlot,
  documentPath,
  type DocumentSlot,
} from "@/lib/media";
import type { PlayerDocuments } from "@/lib/queries";

export function DocumentSlots({
  documents,
  action,
}: {
  documents: PlayerDocuments;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  return (
    <div className="document-slots">
      {DOCUMENT_SLOTS.map((slot) => (
        <DocumentSlotRow
          key={slot.slot}
          slot={slot.slot}
          label={slot.label}
          mediaId={documentIdForSlot(documents, slot.slot)}
          action={action}
        />
      ))}
      <p className="field-hint">PDF, JPEG, or PNG. 2 MB.</p>
    </div>
  );
}

function DocumentSlotRow({
  slot,
  label,
  mediaId,
  action,
}: {
  slot: DocumentSlot;
  label: string;
  mediaId: string | null;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const inputRef = useRef<HTMLInputElement>(null);

  function onFileChange(event: FormEvent<HTMLInputElement>) {
    if (event.currentTarget.files?.length) event.currentTarget.form?.requestSubmit();
  }

  return (
    <form action={formAction} className="document-slot">
      <input type="hidden" name="slot" value={slot} />
      <span className="document-slot-label">{label}</span>
      <span className="document-slot-meta">
        {mediaId ? (
          <a href={documentPath(mediaId)} target="_blank" rel="noreferrer">
            Uploaded
          </a>
        ) : (
          <span className="muted">Not uploaded</span>
        )}
      </span>
      <button
        type="button"
        className="document-slot-action"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
      >
        {pending ? "Saving…" : mediaId ? "Replace" : "Upload"}
      </button>
      <input
        ref={inputRef}
        type="file"
        name="document"
        accept="application/pdf,image/jpeg,image/png"
        className="sr-file"
        tabIndex={-1}
        disabled={pending}
        onChange={onFileChange}
      />
      {state.error ? <div className="form-msg err">{state.error}</div> : null}
    </form>
  );
}

export function DocumentReview({ documents }: { documents: PlayerDocuments }) {
  return (
    <div className="document-review">
      {DOCUMENT_SLOTS.map((slot) => {
        const mediaId = documentIdForSlot(documents, slot.slot);
        return (
          <div key={slot.slot} className="document-review-row">
            <span>{slot.label}</span>
            {mediaId ? (
              <a href={documentPath(mediaId)} target="_blank" rel="noreferrer">
                Open
              </a>
            ) : (
              <span className="muted">Not uploaded</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
