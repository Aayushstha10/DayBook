import { useState, useRef, useEffect } from "react";
import axios from "axios";

const SETTINGS_STORAGE_KEY = "app_settings";

const defaultSettings = [
  {
    id: "notifications",
    label: "Email me a weekly summary",
    description: "A digest of the past week\u2019s spending, every Monday.",
    enabled: true,
  },
  {
    id: "budgetAlerts",
    label: "Budget alerts",
    description: "Warn me when a category goes over budget.",
    enabled: true,
  },
  {
    id: "roundUp",
    label: "Round up amounts",
    description: "Display amounts rounded to the nearest dollar.",
    enabled: false,
  },
  {
    id: "darkMode",
    label: "Dark sidebar",
    description: "Keep the sidebar dark regardless of system theme.",
    enabled: true,
  },
];

const API_BASE = "https://daybook-j903.onrender.com/api";
const EXPENSES_URL = `${API_BASE}/expenses`;

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function loadStoredSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!saved) return defaultSettings;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : defaultSettings;
  } catch {
    // Corrupted or invalid JSON in storage — fall back to defaults
    return defaultSettings;
  }
}

export default function Settings() {
  const [settings, setSettings] = useState(loadStoredSettings);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [status, setStatus] = useState(null);
  const confirmTimeout = useRef(null);
  const statusTimeout = useRef(null);

  const showStatus = (type, message) => {
    setStatus({ type, message });
    clearTimeout(statusTimeout.current);
    statusTimeout.current = setTimeout(() => setStatus(null), 3000);
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(EXPENSES_URL, {
        headers: getAuthHeader(),
      });
      // Adjust this line if your API wraps the array, e.g. res.data.expenses
      const data = Array.isArray(res.data) ? res.data : res.data.expenses || [];

      setTransactions(data);
    } catch (err) {
      showStatus(
        "error",
        err.response?.data?.message || "Failed to load transactions.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    return () => {
      clearTimeout(confirmTimeout.current);
      clearTimeout(statusTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const toggle = (id) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  };

  const escapeCsvCell = (value) => {
    const str = String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleExport = () => {
    try {
      if (transactions.length === 0) {
        showStatus("error", "No transactions to export.");
        return;
      }

      const headers = ["Date", "Merchant", "Category", "Amount"];
      const rows = transactions.map((t) => [
        t.date,
        t.merchant,
        t.category,
        Number(t.amount).toFixed(2),
      ]);
      const csv = [headers, ...rows]
        .map((row) => row.map(escapeCsvCell).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `transactions-${today}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showStatus("success", `Exported ${transactions.length} transactions.`);
    } catch (err) {
      showStatus("error", "Export failed. Please try again.");
    }
  };

  const handleClearClick = async () => {
    if (!confirmingClear) {
      setConfirmingClear(true);
      confirmTimeout.current = setTimeout(
        () => setConfirmingClear(false),
        4000,
      );
      return;
    }

    clearTimeout(confirmTimeout.current);
    setConfirmingClear(false);
    setClearing(true);

    try {
      await axios.delete(EXPENSES_URL, {
        headers: getAuthHeader(),
      });

      setTransactions([]);
      showStatus("success", "All transactions cleared.");
    } catch (err) {
      showStatus(
        "error",
        err.response?.data?.message || "Failed to clear transactions.",
      );
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      {status && (
        <div
          role="status"
          className={`text-xs rounded-card px-4 py-2 border ${
            status.type === "success"
              ? "bg-moss/10 border-moss/20 text-moss"
              : "bg-rust/10 border-rust/20 text-rust"
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="bg-white rounded-card border border-black/5 shadow-card divide-y divide-black/5">
        {settings.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-5">
            <div className="pr-4">
              <p className="text-sm font-medium text-ink">{s.label}</p>
              <p className="text-xs text-slate mt-0.5">{s.description}</p>
            </div>
            <Toggle
              checked={s.enabled}
              onChange={() => toggle(s.id)}
              label={s.label}
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-card border border-black/5 shadow-card p-5">
        <p className="text-sm font-medium text-ink">Export data</p>
        <p className="text-xs text-slate mt-0.5 mb-3">
          {loading
            ? "Loading your transactions..."
            : `Download everything as a CSV file${
                transactions.length > 0
                  ? ` (${transactions.length} transactions)`
                  : ""
              }.`}
        </p>
        <button
          className="btn-ghost border border-black/10 disabled:opacity-50"
          onClick={handleExport}
          disabled={loading || transactions.length === 0}
        >
          Export as CSV
        </button>
      </div>

      <div className="bg-white rounded-card border border-rust/20 shadow-card p-5">
        <p className="text-sm font-medium text-rust">Danger zone</p>
        <p className="text-xs text-slate mt-0.5 mb-3">
          Permanently clear all transactions from your account.
        </p>
        <button
          className="btn-danger disabled:opacity-50"
          onClick={handleClearClick}
          disabled={loading || clearing || transactions.length === 0}
        >
          {clearing
            ? "Clearing..."
            : confirmingClear
              ? "Click again to confirm"
              : "Clear all data"}
        </button>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors shrink-0 relative
        ${checked ? "bg-moss" : "bg-black/10"}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
          ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`}
      />
    </button>
  );
}