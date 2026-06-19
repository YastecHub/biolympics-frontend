import { Link } from "react-router-dom";

export function SectionHeader({
  title,
  to,
  linkLabel = "See all",
  count,
}: {
  title: string;
  to?: string;
  linkLabel?: string;
  count?: number;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="section-title flex items-center gap-2">
        {title}
        {count != null && (
          <span className="chip bg-brand-primary/15 text-brand-primary">{count}</span>
        )}
      </h2>
      {to && (
        <Link
          to={to}
          className="text-sm font-semibold text-brand-primary hover:underline"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
