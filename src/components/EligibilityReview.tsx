"use client";

import { useActionState } from "react";
import { adminSetEligibility } from "@/app/actions/admin";
import type { PlayerListItem } from "@/lib/types";
import { EligibilityBadge } from "./EligibilityBadge";

export function EligibilityReview({ player }: { player: PlayerListItem }) {
  const [state, action, pending] = useActionState(adminSetEligibility, {});

  return (
    <div className="elig-review">
      <div className="elig-review-head">
        <span>Eligibility</span>
        <EligibilityBadge player={player} />
      </div>
      {state.error ? <div className="form-msg err">{state.error}</div> : null}
      <div className="elig-actions">
        <form action={action}>
          <input type="hidden" name="profileId" value={player.id} />
          <input type="hidden" name="eligibilityStatus" value="confirmed" />
          <button type="submit" className="btn btn-navy btn-small" disabled={pending}>
            Confirm
          </button>
        </form>
        <form action={action}>
          <input type="hidden" name="profileId" value={player.id} />
          <input type="hidden" name="eligibilityStatus" value="rejected" />
          <button type="submit" className="btn btn-ghost-ink btn-small" disabled={pending}>
            Reject
          </button>
        </form>
      </div>
    </div>
  );
}
