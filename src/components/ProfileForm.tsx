"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/actions/auth";
import {
  BattingSelect,
  BowlingSelect,
  CitySelect,
  ExperienceSelect,
  RoleSelect,
  TextField,
} from "./FormFields";
import type { FranchiseRow, PlayerListItem } from "@/lib/types";

export function ProfileForm({
  player,
  action,
  franchises,
  assignFranchise = false,
}: {
  player: PlayerListItem;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  franchises?: FranchiseRow[];
  assignFranchise?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="portal-form">
      {assignFranchise ? <input type="hidden" name="profileId" value={player.id} /> : null}
      {state.error ? <div className="form-msg err">{state.error}</div> : null}
      <div className="frow">
        <TextField
          id="fullName"
          name="fullName"
          label="Full name"
          defaultValue={player.full_name}
          required
          error={state.fieldErrors?.fullName}
        />
        <TextField
          id="phone"
          name="phone"
          label="Phone"
          defaultValue={player.phone ?? ""}
          required
          error={state.fieldErrors?.phone}
        />
      </div>
      <div className="frow">
        <CitySelect
          id="city"
          name="city"
          label="City"
          defaultValue={player.city}
          required
          error={state.fieldErrors?.city}
        />
        <RoleSelect
          id="playingRole"
          name="playingRole"
          label="Playing role"
          defaultValue={player.playing_role}
          required
          error={state.fieldErrors?.playingRole}
        />
      </div>
      <div className="frow">
        <ExperienceSelect
          id="experience"
          name="experience"
          label="Experience"
          defaultValue={player.experience}
          required
          full
          error={state.fieldErrors?.experience}
        />
      </div>
      <div className="frow">
        <BattingSelect
          id="battingHand"
          name="battingHand"
          label="Batting"
          defaultValue={player.batting_hand ?? ""}
          error={state.fieldErrors?.battingHand}
        />
        <BowlingSelect
          id="bowlingStyle"
          name="bowlingStyle"
          label="Bowling"
          defaultValue={player.bowling_style ?? ""}
          error={state.fieldErrors?.bowlingStyle}
        />
      </div>
      {assignFranchise && franchises ? (
        <div className="frow">
          <div className="field full">
            <label htmlFor="franchiseId">Franchise</label>
            <select id="franchiseId" name="franchiseId" defaultValue={player.franchise_id ?? ""}>
              <option value="">Unassigned</option>
              {franchises.map((franchise) => (
                <option key={franchise.id} value={franchise.id}>
                  {franchise.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}
      <button type="submit" className="btn btn-navy" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
