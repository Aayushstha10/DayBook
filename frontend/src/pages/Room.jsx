import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, Receipt, AlertCircle, ChevronDown } from "lucide-react";

/**
 * ExpenseSummary
 * Groups raw expense records by user (email), shows each person's
 * total number of entries and total amount, and lets you expand a
 * card to see the individual expenses. Tailwind only, responsive
 * from mobile up.
 */

function formatAmount(n) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

export default function ExpenseSummary() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(() => new Set());

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/allexpenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Couldn't load expenses. Check the connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Group by user email -> { name, email, count, total, items: [] }
  const summaries = useMemo(() => {
    const byEmail = new Map();

    for (const exp of expenses) {
      const email = exp.user?.email || "unknown@no-email";
      const name = exp.user?.name || "Unknown user";
      const amount = Number(exp.amount) || 0;

      if (!byEmail.has(email)) {
        byEmail.set(email, { name, email, count: 0, total: 0, items: [] });
      }
      const entry = byEmail.get(email);
      entry.count += 1;
      entry.total += amount;
      entry.items.push(exp);
    }

    return Array.from(byEmail.values()).sort((a, b) => b.total - a.total);
  }, [expenses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return summaries;
    return summaries.filter(
      (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [summaries, query]);

  const toggleExpanded = (email) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Expense Summary</h1>
            <p className="text-sm text-slate-500 mt-1">
              {loading
                ? "Loading…"
                : `${summaries.length} ${summaries.length === 1 ? "person" : "people"}`}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-xl border border-slate-200 bg-white animate-pulse"
              />
            ))}

          {!loading && error && (
            <div className="col-span-full flex flex-col items-center justify-center gap-2 py-16 text-center rounded-xl border border-dashed border-slate-300 bg-white">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-sm text-slate-500">{error}</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center gap-2 py-16 text-center rounded-xl border border-dashed border-slate-300 bg-white">
              <Receipt className="w-6 h-6 text-blue-500" />
              <p className="text-sm text-slate-500">No expenses match yet.</p>
            </div>
          )}

          {!loading &&
            !error &&
            filtered.map((s) => {
              const isOpen = expanded.has(s.email);
              return (
                <div
                  key={s.email}
                  className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-none w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-semibold text-sm flex items-center justify-center">
                      {initials(s.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{s.name}</p>
                      <p className="text-xs text-slate-500 truncate">{s.email}</p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Total entries
                      </p>
                      <p className="text-lg font-semibold text-slate-900">{s.count}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Total</p>
                      <p className="text-lg font-semibold text-blue-600">
                       रु {formatAmount(s.total)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExpanded(s.email)}
                    className="flex items-center justify-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 pt-1"
                  >
                    {isOpen ? "Hide expenses" : "Show expenses"}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
                      {s.items.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between gap-3 text-sm py-1.5"
                        >
                          <div className="min-w-0">
                            <p className="text-slate-800 truncate">{item.title}</p>
                            <span className="inline-block mt-0.5 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                              {item.category || "Uncategorized"}
                            </span>
                          </div>
                          <span className="flex-none font-medium text-slate-700">
                            रु {formatAmount(Number(item.amount) || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
