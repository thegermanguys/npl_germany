import { formatStat, statsSourceLabel } from "@/lib/stats-display";
import type { PlayerListItem } from "@/lib/types";

function CricHeroesLink({ player, children }: { player: PlayerListItem; children: string }) {
  if (!player.cricheroes_url) return null;
  return (
    <a className="stats-link" href={player.cricheroes_url} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export function PlayerStatsStrip({
  player,
  linked = true,
}: {
  player: PlayerListItem;
  linked?: boolean;
}) {
  return (
    <div className="ch-card-stats">
      <div className="ch-stat">
        <strong>{formatStat(player.stats_matches)}</strong>
        <span>Matches</span>
      </div>
      <div className="ch-stat">
        <strong>{formatStat(player.stats_runs)}</strong>
        <span>Runs</span>
      </div>
      <div className="ch-stat">
        <strong>{formatStat(player.stats_wickets)}</strong>
        <span>Wickets</span>
      </div>
      {linked ? <CricHeroesLink player={player}>CricHeroes</CricHeroesLink> : null}
    </div>
  );
}

export function PlayerStatsDetail({ player }: { player: PlayerListItem }) {
  const source = statsSourceLabel(player);
  const extra =
    player.stats_batting_avg !== null ||
    player.stats_strike_rate !== null ||
    player.stats_economy !== null ||
    player.stats_high_score !== null ||
    Boolean(player.stats_best_bowling);

  return (
    <div className="stats-detail">
      <div className="stats-detail-head">
        <h3>Auction stats</h3>
        <CricHeroesLink player={player}>CricHeroes profile</CricHeroesLink>
      </div>
      {source ? <p className="muted">{source}</p> : null}
      <PlayerStatsStrip player={player} linked={false} />
      {extra ? (
        <dl className="profile-dl">
          <div>
            <dt>Bat avg</dt>
            <dd>{formatStat(player.stats_batting_avg)}</dd>
          </div>
          <div>
            <dt>Strike rate</dt>
            <dd>{formatStat(player.stats_strike_rate)}</dd>
          </div>
          <div>
            <dt>Economy</dt>
            <dd>{formatStat(player.stats_economy)}</dd>
          </div>
          <div>
            <dt>High score</dt>
            <dd>{formatStat(player.stats_high_score)}</dd>
          </div>
          <div>
            <dt>Best bowling</dt>
            <dd>{player.stats_best_bowling || "—"}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
