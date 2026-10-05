"use client";

import { startTransition, useActionState, useEffect, useState, type FormEvent } from "react";
import type { ActionState } from "@/app/actions/auth";
import { lookupCricHeroesStats } from "@/app/actions/players";
import {
  BattingSelect,
  BowlingSelect,
  CitySelect,
  ExperienceSelect,
  RoleSelect,
  TextField,
} from "./FormFields";
import { SAMPLE_SHARE_URL, type PlayerStats } from "@/lib/cricheroes";
import type { FranchiseRow, PlayerListItem } from "@/lib/types";

function statsToFields(player: PlayerListItem, extra?: PlayerStats | null) {
  return {
    matches: (extra?.matches ?? player.stats_matches)?.toString() ?? "",
    runs: (extra?.runs ?? player.stats_runs)?.toString() ?? "",
    wickets: (extra?.wickets ?? player.stats_wickets)?.toString() ?? "",
    battingAvg: (extra?.battingAvg ?? player.stats_batting_avg)?.toString() ?? "",
    strikeRate: (extra?.strikeRate ?? player.stats_strike_rate)?.toString() ?? "",
    economy: (extra?.economy ?? player.stats_economy)?.toString() ?? "",
    highScore: (extra?.highScore ?? player.stats_high_score)?.toString() ?? "",
    bestBowling: extra?.bestBowling ?? player.stats_best_bowling ?? "",
  };
}

type StatFields = ReturnType<typeof statsToFields>;

function fillBlankFields(current: StatFields, fetched: StatFields): StatFields {
  const next = { ...current };
  for (const key of Object.keys(current) as (keyof StatFields)[]) {
    if (!current[key].trim()) next[key] = fetched[key];
  }
  return next;
}

export function ProfileForm({
  player,
  action,
  franchises,
  assignFranchise = false,
  initialNotice = null,
}: {
  player: PlayerListItem;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  franchises?: FranchiseRow[];
  assignFranchise?: boolean;
  initialNotice?: string | null;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [stats, setStats] = useState(() => statsToFields(player));
  const [cricheroesUrl, setCricheroesUrl] = useState(player.cricheroes_url ?? "");

  useEffect(() => {
    if (state.stats) setStats(statsToFields(player, state.stats));
  }, [player, state.stats]);

  async function fillFromUrl(raw: string) {
    try {
      const result = await lookupCricHeroesStats(raw);
      const found = result.stats;
      if (!found) return;
      const fetched = statsToFields(player, found);
      setStats((current) => fillBlankFields(current, fetched));
    } catch {
      // A blocked read must not look like the profile failed to save.
    }
  }

  const shown = stats;
  const notice = state.notice ?? initialNotice;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(data);
    });
  }

  return (
    <form className="portal-form" onSubmit={onSubmit}>
      {assignFranchise ? <input type="hidden" name="profileId" value={player.id} /> : null}
      {state.error ? <div className="form-msg err">{state.error}</div> : null}
      {notice && !state.error ? <div className="form-msg note">{notice}</div> : null}
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
      <div className="frow">
        <TextField
          id="cricheroesUrl"
          name="cricheroesUrl"
          label="CricHeroes profile"
          value={cricheroesUrl}
          onChange={(event) => setCricheroesUrl(event.target.value)}
          placeholder={SAMPLE_SHARE_URL}
          required
          full
          error={state.fieldErrors?.cricheroesUrl}
          onBlur={(event) => {
            void fillFromUrl(event.currentTarget.value);
          }}
        />
      </div>
      <div className="check-row">
        <label>
          <input type="checkbox" name="nepaliCitizen" value="yes" defaultChecked={player.nepali_citizen} />
          Nepali national
        </label>
        {state.fieldErrors?.nepaliCitizen ? (
          <span className="field-error">{state.fieldErrors.nepaliCitizen}</span>
        ) : null}
        <label>
          <input
            type="checkbox"
            name="germanyLegalResident"
            value="yes"
            defaultChecked={player.germany_legal_resident}
          />
          Legal status living in Germany
        </label>
        {state.fieldErrors?.germanyLegalResident ? (
          <span className="field-error">{state.fieldErrors.germanyLegalResident}</span>
        ) : null}
      </div>
      <div className="frow">
        <TextField id="statsMatches" name="statsMatches" label="Matches" type="number" value={shown.matches} onChange={(event) => setStats({ ...shown, matches: event.currentTarget.value })} />
        <TextField id="statsRuns" name="statsRuns" label="Runs" type="number" value={shown.runs} onChange={(event) => setStats({ ...shown, runs: event.currentTarget.value })} />
      </div>
      <div className="frow">
        <TextField id="statsWickets" name="statsWickets" label="Wickets" type="number" value={shown.wickets} onChange={(event) => setStats({ ...shown, wickets: event.currentTarget.value })} />
        <TextField
          id="statsBattingAvg"
          name="statsBattingAvg"
          label="Bat avg"
          value={shown.battingAvg}
          onChange={(event) => setStats({ ...shown, battingAvg: event.currentTarget.value })}
        />
      </div>
      <div className="frow">
        <TextField
          id="statsStrikeRate"
          name="statsStrikeRate"
          label="Strike rate"
          value={shown.strikeRate}
          onChange={(event) => setStats({ ...shown, strikeRate: event.currentTarget.value })}
        />
        <TextField
          id="statsEconomy"
          name="statsEconomy"
          label="Economy"
          value={shown.economy}
          onChange={(event) => setStats({ ...shown, economy: event.currentTarget.value })}
        />
      </div>
      <div className="frow">
        <TextField
          id="statsHighScore"
          name="statsHighScore"
          label="High score"
          value={shown.highScore}
          onChange={(event) => setStats({ ...shown, highScore: event.currentTarget.value })}
        />
        <TextField
          id="statsBestBowling"
          name="statsBestBowling"
          label="Best bowling"
          value={shown.bestBowling}
          onChange={(event) => setStats({ ...shown, bestBowling: event.currentTarget.value })}
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
