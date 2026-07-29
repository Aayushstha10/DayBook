import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LedgerIcon },
  { to: "/transaction", label: "Transactions", icon: ListIcon },
  { to: "/profile", label: "Profile", icon: UserIcon },
  { to: "/settings", label: "Settings", icon: GearIcon },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-ink text-paper flex flex-col
          transform transition-transform duration-200 md:translate-x-0 md:static md:flex
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-semibold tracking-tight">
              {/* Ledger */}
              Daybook
            </span>
            <span className="text-gold text-xs font-mono">v1</span>
          </div>
          <p className="text-slate-light text-xs mt-1">
            Every Nepali Rupees, Accounted for.
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${isActive ? "bg-moss text-white" : "text-paper/80 hover:bg-white/5 hover:text-white"}`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-white/10">
          <p className="text-xs text-slate-light leading-relaxed">
            Data lives only in this browser — nothing leaves your device.
          </p>
        </div>
      </aside>
    </>
  );
}

function LedgerIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
    </svg>
  );
}
function ListIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
    </svg>
  );
}
function ChartIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M4 20V10M12 20V4M20 20v-7" strokeLinecap="round" />
    </svg>
  );
}
function UserIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <circle cx="12" cy="8" r="3.2" />
      <path
        d="M5 20c1.4-3.6 4.2-5.4 7-5.4s5.6 1.8 7 5.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function GearIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 13a7.7 7.7 0 000-2l2-1.5-2-3.4-2.3.9a7.6 7.6 0 00-1.8-1L15 3.5h-4l-.3 2.5a7.6 7.6 0 00-1.8 1l-2.3-.9-2 3.4L6.6 11a7.7 7.7 0 000 2l-2 1.5 2 3.4 2.3-.9c.55.44 1.16.79 1.8 1l.3 2.5h4l.3-2.5c.64-.21 1.25-.56 1.8-1l2.3.9 2-3.4-2-1.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
