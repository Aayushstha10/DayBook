import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, Receipt, AlertCircle, ChevronDown } from "lucide-react";

function formatAmount(n) {
  return Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

export default function ExpenseSummary() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(new Set());

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://daybook-j903.onrender.com/api/allexpenses",
      );

      console.log("API Response:", res.data);

      if (Array.isArray(res.data)) {
        setExpenses(res.data);
      } else if (Array.isArray(res.data.expenses)) {
        setExpenses(res.data.expenses);
      } else {
        setExpenses([]);
      }
    } catch (err) {
      console.error(err);
      setError("Couldn't load expenses.");
    } finally {
      setLoading(false);
    }
  };

  const summaries = useMemo(() => {
    const map = new Map();

    expenses.forEach((exp) => {
      const email = exp.user?.email || "unknown";
      const name = exp.user?.name || "Unknown User";
      const amount = Number(exp.amount) || 0;

      if (!map.has(email)) {
        map.set(email, {
          name,
          email,
          count: 0,
          total: 0,
          items: [],
        });
      }

      const item = map.get(email);
      item.count++;
      item.total += amount;
      item.items.push(exp);
    });

    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [expenses]);

  const filtered = useMemo(() => {
    if (!query.trim()) return summaries;

    return summaries.filter(
      (user) =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, summaries]);

  const toggleExpanded = (email) => {
    setExpanded((prev) => {
      const next = new Set(prev);

      if (next.has(email)) {
        next.delete(email);
      } else {
        next.add(email);
      }

      return next;
    });
  };
  const isAdmin = localStorage.getItem("role") === "admin";
  const API="https://daybook-j903.onrender.com";
  
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API}/admin/expenses${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExpenses((prev) => prev.filter((item) => item._id !== id));
      setDeleteId(null);
      toast.success("Expense deleted successfully");
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete expense");
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(`${API}/${editExpense._id}`, editExpense, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExpenses((prev) =>
        prev.map((item) =>
          item._id === editExpense._id ? res.data.expense : item,
        ),
      );

      toast.success("Expense updated successfully");
      setEditExpense(null);
    } catch (err) {
      console.log(err);
      toast.error("Failed to update expense");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Expense Summary</h1>
            <p className="text-gray-500">
              {loading
                ? "Loading..."
                : `${summaries.length} ${
                    summaries.length === 1 ? "Person" : "People"
                  }`}
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search user..."
              className="pl-10 pr-3 py-2 border rounded-lg w-full md:w-72"
            />
          </div>
        </div>

        {loading && (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        )}

        {!loading && error && (
          <div className="text-center py-10">
            <AlertCircle className="mx-auto text-red-500" />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-10">
            <Receipt className="mx-auto text-blue-500" />
            <p>No expenses found.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {!loading &&
            !error &&
            filtered.map((user) => {
              const open = expanded.has(user.email);

              return (
                <div
                  key={user.email}
                  className="bg-white rounded-xl shadow p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                      {initials(user.name)}
                    </div>

                    <div>
                      <h2 className="font-semibold">{user.name}</h2>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Total Entries</p>
                      <h3 className="text-xl font-bold">{user.count}</h3>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total Amount</p>

                      <h3 className="text-xl font-bold text-blue-600">
                        रु {formatAmount(user.total)}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExpanded(user.email)}
                    className="w-full mt-4 flex justify-center items-center gap-1 text-sm text-blue-600"
                  >
                    {open ? "Hide Expenses" : "Show Expenses"}

                    <ChevronDown
                      className={`h-4 w-4 ${
                        open ? "rotate-180" : ""
                      } transition`}
                    />
                  </button>

                  {open && (
                    <div className="mt-4 border-t pt-3 space-y-3">
                      {user.items.map((item) => (
                        <div key={item._id} className="flex justify-between">
                          <div>
                            <p className="font-medium">{item.title}</p>

                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {item.category}
                            </span>
                          </div>

                          <div className="text-right">
                            <div className="font-semibold">
                              रु {formatAmount(item.amount)}
                            </div>

                            {isAdmin && (
                              <div className="flex gap-2 mt-2 justify-end">
                                <button
                                  onClick={() => handleUpdate(item)}
                                  className="bg-blue-500 text-white text-xs px-2 py-1 rounded"
                                >
                                  Update
                                </button>

                                <button
                                  onClick={() => handleDelete(item._id)}
                                  className="bg-red-500 text-white text-xs px-2 py-1 rounded"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
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
