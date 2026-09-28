import { formatEuro } from "@/lib/auction";

export function PurseMeter({
  spent,
  total,
}: {
  spent: number;
  total: number;
}) {
  const cap = total > 0 ? total : 1;
  const pct = Math.min(100, Math.round((spent / cap) * 100));
  const over = spent > total;

  return (
    <div className="purse-meter">
      <div className="purse-row">
        <span>Purse</span>
        <strong>
          {formatEuro(spent)} / {formatEuro(total)}
        </strong>
      </div>
      <div className="purse-bar" aria-hidden="true">
        <span className={over ? "over" : undefined} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
