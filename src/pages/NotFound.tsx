import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="grid place-items-center py-20 text-center">
      <p className="font-display text-6xl font-bold text-brand-primary">404</p>
      <p className="mt-2 text-lg font-semibold">That page isn&apos;t on the scoreboard.</p>
      <Link to="/" className="btn-primary mt-4">
        Back to home
      </Link>
    </div>
  );
}
