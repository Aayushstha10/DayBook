import React, { useMemo, useState } from "react";
import {
  Plus,
  X,
  Users,
  Mail,
  ChevronDown,
  UserPlus,
  Trash2,
  Receipt,
} from "lucide-react";

const initialMembers = [
  { id: 1, name: "Aayush", email: "aayush@example.com", isAdmin: true },
  { id: 2, name: "Ram", email: "ram@example.com", isAdmin: false },
  { id: 3, name: "Sita", email: "sita@example.com", isAdmin: false },
];

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Travel",
  "Health",
  "Education",
  "Other",
];

const tokens = {
  bg: "#F5F7F1",
  ink: "#1B2620",
  surface: "#FFFFFF",
  border: "#E2E6DC",
  teal: "#2F6F5E",
  tealDark: "#24594B",
  tealSoft: "#E7EFEA",
  gold: "#C98A2B",
  brick: "#BE4B3C",
  brickSoft: "#FBEAE7",
  muted: "#6B7568",
};

const avatarPalette = ["#2F6F5E", "#C98A2B", "#5B6EA6", "#BE4B3C", "#4E8B7A"];

export default function Room() {
  const [members, setMembers] = useState(initialMembers);
  const [showAddMember, setShowAddMember] = useState(false);
  const [membersOpen, setMembersOpen] = useState(true);
  const [splitOpen, setSplitOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");

  const [expense, setExpense] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
    paidBy: initialMembers[0]?.id ?? "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastExpense, setLastExpense] = useState(null);

  const splitAmount = useMemo(() => {
    const amount = Number(expense.amount);
    if (!amount || members.length === 0) return 0;
    return amount / members.length;
  }, [expense.amount, members.length]);

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setExpense((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const email = memberEmail.trim().toLowerCase();
    if (!email) return setError("Please enter an email address.");
    if (!email.includes("@")) return setError("Please enter a valid email address.");

    const alreadyExists = members.some((m) => m.email.toLowerCase() === email);
    if (alreadyExists) return setError("This user is already a room member.");

    const newMember = {
      id: Date.now(),
      name: email.split("@")[0],
      email,
      isAdmin: false,
    };

    setMembers((prev) => [...prev, newMember]);
    setMemberEmail("");
    setShowAddMember(false);
    setLastExpense(null);
    setSuccess("Member added successfully.");
  };

  const handleRemoveMember = (id) => {
    const member = members.find((m) => m.id === id);
    if (member?.isAdmin) return setError("The room admin cannot be removed.");
    setLastExpense(null);
    setSuccess("");
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!expense.title.trim()) return setError("Please enter an expense title.");
    if (!expense.amount || Number(expense.amount) <= 0)
      return setError("Please enter a valid amount.");
    if (!expense.date) return setError("Please select a date.");
    if (members.length === 0) return setError("There are no members in this room.");
    if (!expense.paidBy) return setError("Please select who paid.");

    const payer = members.find((m) => m.id === Number(expense.paidBy));

    const expenseData = {
      ...expense,
      amount: Number(expense.amount),
      splitType: "equal",
      members: members.map((m) => ({
        user: m.id,
        amount: Number(splitAmount.toFixed(2)),
      })),
    };

    console.log("Expense:", expenseData);
    setSuccess("Expense added successfully.");
    setLastExpense({
      title: expense.title,
      amount: Number(expense.amount),
      category: expense.category,
      date: expense.date,
      payer,
    });
    setExpense({
      title: "",
      amount: "",
      category: "Food",
      date: new Date().toISOString().split("T")[0],
      paidBy: members[0]?.id ?? "",
    });
  };

  return (
    <div className="min-h-screen font-body" style={{ background: tokens.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, serif; }
        .font-body { font-family: 'Inter', system-ui, sans-serif; }
        .num { font-variant-numeric: tabular-nums; }
        .field:focus { outline: none; border-color: ${tokens.teal} !important; box-shadow: 0 0 0 3px ${tokens.tealSoft}; }
        .tear {
          height: 10px;
          background-image:
            linear-gradient(135deg, ${tokens.surface} 25%, transparent 25%),
            linear-gradient(225deg, ${tokens.surface} 25%, transparent 25%);
          background-size: 14px 14px;
          background-position: 0 0;
        }
      `}</style>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ background: tokens.teal, color: "#fff" }}
            >
              <Receipt size={19} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold" style={{ color: tokens.ink }}>
                Daybook
              </h1>
              <p className="text-sm" style={{ color: tokens.muted }}>
                Track shared spending, split evenly, settle up
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setShowAddMember(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.97]"
            style={{ background: tokens.ink, color: "#fff" }}
          >
            <UserPlus size={16} />
            Add member
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div
            className="mb-5 rounded-xl px-4 py-3 text-sm"
            style={{ background: tokens.brickSoft, color: tokens.brick }}
          >
            {error}
          </div>
        )}

        {success && !lastExpense && (
          <div
            className="mb-5 rounded-xl px-4 py-3 text-sm"
            style={{ background: tokens.tealSoft, color: tokens.tealDark }}
          >
            {success}
          </div>
        )}

        {success && lastExpense && (
          <div
            className="mb-6 overflow-hidden rounded-2xl"
            style={{ background: tokens.surface, border: `1px solid ${tokens.border}` }}
          >
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: tokens.teal }}
                >
                  Added to the ledger
                </p>
                <p className="mt-1 truncate font-display text-lg font-semibold" style={{ color: tokens.ink }}>
                  {lastExpense.title}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: tokens.muted }}>
                  {lastExpense.category} ·{" "}
                  {new Date(lastExpense.date).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {lastExpense.payer && (
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                      style={{ background: tokens.tealSoft, color: tokens.tealDark }}
                    >
                      {lastExpense.payer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-[11px]" style={{ color: tokens.muted }}>Paid by</p>
                      <p className="truncate text-sm font-medium" style={{ color: tokens.ink }}>
                        {lastExpense.payer.name}
                      </p>
                    </div>
                  </div>
                )}
                <p className="font-display num text-xl font-semibold" style={{ color: tokens.ink }}>
                  Rs. {lastExpense.amount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Members */}
          <section
            className="overflow-hidden rounded-2xl lg:col-span-2"
            style={{ background: tokens.surface, border: `1px solid ${tokens.border}` }}
          >
            <button
              type="button"
              onClick={() => setMembersOpen((prev) => !prev)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <h2 className="flex items-center gap-2 text-sm font-semibold" style={{ color: tokens.ink }}>
                <Users size={15} style={{ color: tokens.muted }} />
                Members
                <span className="font-normal" style={{ color: tokens.muted }}>
                  ({members.length})
                </span>
              </h2>
              <ChevronDown
                size={16}
                style={{
                  color: tokens.muted,
                  transform: membersOpen ? "rotate(180deg)" : "none",
                  transition: "transform 150ms ease",
                }}
              />
            </button>

            {membersOpen && (
              <ul style={{ borderTop: `1px solid ${tokens.border}` }}>
                {members.map((member, i) => (
                  <li
                    key={member.id}
                    className="flex items-center gap-3 px-5 py-3.5"
                    style={{
                      borderBottom:
                        i === members.length - 1 ? "none" : `1px solid ${tokens.border}`,
                    }}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ background: avatarPalette[i % avatarPalette.length] }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-medium" style={{ color: tokens.ink }}>
                          {member.name}
                        </p>
                        {member.isAdmin && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{ background: tokens.tealSoft, color: tokens.tealDark }}
                          >
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs" style={{ color: tokens.muted }}>
                        {member.email}
                      </p>
                    </div>

                    {!member.isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="rounded-lg p-1.5 transition"
                        style={{ color: tokens.muted }}
                        title="Remove member"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Add Expense */}
          <section
            className="overflow-hidden rounded-2xl lg:col-span-3"
            style={{ background: tokens.surface, border: `1px solid ${tokens.border}` }}
          >
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${tokens.border}` }}>
              <h2 className="text-sm font-semibold" style={{ color: tokens.ink }}>
                Add an expense
              </h2>
              <p className="text-xs" style={{ color: tokens.muted }}>
                Split equally across all {members.length} members
              </p>
            </div>

            <form onSubmit={handleAddExpense} className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: tokens.muted }}>
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={expense.title}
                    onChange={handleExpenseChange}
                    placeholder="e.g. Dinner"
                    className="field w-full rounded-lg px-3 py-2.5 text-sm transition"
                    style={{ border: `1px solid ${tokens.border}`, color: tokens.ink }}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: tokens.muted }}>
                    Amount
                  </label>
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                      style={{ color: tokens.muted }}
                    >
                      Rs.
                    </span>
                    <input
                      type="number"
                      name="amount"
                      min="1"
                      step="0.01"
                      value={expense.amount}
                      onChange={handleExpenseChange}
                      placeholder="1500"
                      className="field num w-full rounded-lg py-2.5 pl-10 pr-3 text-sm transition"
                      style={{ border: `1px solid ${tokens.border}`, color: tokens.ink }}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: tokens.muted }}>
                    Category
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={expense.category}
                      onChange={handleExpenseChange}
                      className="field w-full appearance-none rounded-lg px-3 py-2.5 pr-9 text-sm transition"
                      style={{ border: `1px solid ${tokens.border}`, color: tokens.ink }}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: tokens.muted }}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: tokens.muted }}>
                    Paid by
                  </label>
                  <div className="relative">
                    <select
                      name="paidBy"
                      value={expense.paidBy}
                      onChange={handleExpenseChange}
                      className="field w-full appearance-none rounded-lg px-3 py-2.5 pr-9 text-sm transition"
                      style={{ border: `1px solid ${tokens.border}`, color: tokens.ink }}
                    >
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: tokens.muted }}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: tokens.muted }}>
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={expense.date}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={handleExpenseChange}
                    className="field w-full rounded-lg px-3 py-2.5 text-sm transition"
                    style={{ border: `1px solid ${tokens.border}`, color: tokens.ink }}
                  />
                </div>
              </div>

              {/* Split preview — receipt style */}
              <div className="mt-6 overflow-hidden rounded-xl" style={{ border: `1px solid ${tokens.border}` }}>
                <div className="flex items-center justify-between px-4 pb-3 pt-4" style={{ background: tokens.surface }}>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.muted }}>
                    Split preview
                  </span>
                  <button
                    type="button"
                    onClick={() => setSplitOpen((prev) => !prev)}
                    aria-pressed={splitOpen}
                    aria-label="Toggle split preview"
                    className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition"
                    style={{ background: splitOpen ? tokens.teal : tokens.border }}
                  >
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition"
                      style={{ transform: splitOpen ? "translateX(18px)" : "translateX(4px)" }}
                    />
                  </button>
                </div>

                {splitOpen && (
                  <div className="px-4 pb-4" style={{ background: tokens.surface }}>
                    <div className="space-y-1.5">
                      {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between text-sm">
                          <span style={{ color: tokens.ink }}>{member.name}</span>
                          <span className="num font-medium" style={{ color: tokens.ink }}>
                            Rs. {Number.isFinite(splitAmount) ? splitAmount.toFixed(2) : "0.00"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="tear" />
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ background: tokens.ink }}
                >
                  <span className="text-sm font-medium text-white">Total</span>
                  <span className="font-display num text-lg font-semibold" style={{ color: tokens.gold }}>
                    Rs. {Number(expense.amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.99]"
                style={{ background: tokens.teal }}
              >
                <Plus size={16} />
                Add expense
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl" style={{ background: tokens.surface }}>
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: `1px solid ${tokens.border}` }}
            >
              <h2 className="font-display text-base font-semibold" style={{ color: tokens.ink }}>
                Add room member
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowAddMember(false);
                  setMemberEmail("");
                  setError("");
                }}
                className="rounded-lg p-1"
                style={{ color: tokens.muted }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-5">
              <label className="mb-1.5 block text-xs font-medium" style={{ color: tokens.muted }}>
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: tokens.muted }}
                />
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="user@example.com"
                  autoFocus
                  className="field w-full rounded-lg py-2.5 pl-9 pr-3 text-sm transition"
                  style={{ border: `1px solid ${tokens.border}`, color: tokens.ink }}
                />
              </div>
              <p className="mt-1.5 text-xs" style={{ color: tokens.muted }}>
                The user must already have an account.
              </p>

              {error && (
                <div
                  className="mt-3 rounded-lg px-3 py-2 text-xs"
                  style={{ background: tokens.brickSoft, color: tokens.brick }}
                >
                  {error}
                </div>
              )}

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMember(false);
                    setMemberEmail("");
                    setError("");
                  }}
                  className="w-full rounded-full px-4 py-2.5 text-sm font-medium transition sm:w-auto"
                  style={{ border: `1px solid ${tokens.border}`, color: tokens.ink }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition sm:w-auto"
                  style={{ background: tokens.teal }}
                >
                  <UserPlus size={15} />
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}