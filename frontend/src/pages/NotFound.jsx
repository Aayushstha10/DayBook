import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="text-center">
        <p className="font-mono text-sm text-gold mb-2">Error 404</p>
        <h1 className="font-display text-4xl font-semibold text-ink">
          Page not found
        </h1>
        <p className="text-slate mt-3 max-w-sm mx-auto">
          The page you're looking for doesn't exist, or the entry never made it
          into the ledger.
        </p>
        <Link to="/" className="btn-primary inline-block mt-6">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
