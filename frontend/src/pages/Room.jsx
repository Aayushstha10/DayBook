import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import {
  Receipt,
  AlertCircle,
  Lock,
  Plus,
  X,
  UserPlus,
  Trash2,
  Pencil,
  Users,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";


const BASE = "https://daybook-j903.onrender.com/api";

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

function getCurrentUserEmail() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email || payload.user?.email || null;
  } catch {
    return null;
  }
}

export default function Room() {
  const { id:roomId } = useParams(); // adjust if you're using a different router setup

  const [room, setRoom] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState("");

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null); // expense object or null

  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  });
  const [editForm, setEditForm] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
    splitAmong: [], // emails
  });
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const token = localStorage.getItem("token");
  const authHeaders = { Authorization: `Bearer ${token}` };
  const currentUserEmail = useMemo(() => getCurrentUserEmail(), []);

  useEffect(() => {
    fetchRoomAndExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const fetchRoomAndExpenses = async () => {
    try {
      setLoading(true);
      setError("");
      setForbidden(false);

      const roomRes = await api.get(`${BASE}/rooms/${roomId}`, {
        headers: authHeaders,
      });

      setRoom(roomRes.data.room);
      setIsAdmin(roomRes.data.isAdmin);

      const expRes = await api.get(`${BASE}/rooms/${roomId}/expenses`, {
        headers: authHeaders,
      });

      setExpenses(expRes.data.expenses || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setForbidden(true);
      } else if (err.response?.status === 404) {
        setError("Room not found.");
      } else {
        setError("Couldn't load this room.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Everyone who a new expense can be split among: the admin (room creator)
  // plus every member who has actually joined (pending invites don't share
  // the bill yet).
  const allParticipantEmails = useMemo(() => {
    if (!room) return [];
    const emails = new Set(
      (room.members || [])
        .filter((m) => m.status === "joined")
        .map((m) => m.email)
    );
    if (room.admin?.email) {
      emails.add(room.admin.email);
    } else if (isAdmin && currentUserEmail) {
      emails.add(currentUserEmail);
    }
    return [...emails];
  }, [room, isAdmin, currentUserEmail]);

  // group expenses by member, same pattern as ExpenseSummary
  const summaries = useMemo(() => {
    const map = new Map();

    expenses.forEach((exp) => {
      const email = exp.user?.email || "unknown";
      const name = exp.user?.name || "Unknown User";
      const amount = Number(exp.amount) || 0;

      if (!map.has(email)) {
        map.set(email, { name, email, count: 0, total: 0, items: [] });
      }

      const item = map.get(email);
      item.count++;
      item.total += amount;
      item.items.push(exp);
    });

    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [expenses]);

  const roomTotal = useMemo(
    () => expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [expenses]
  );

  const canEditExpense = (exp) =>
    isAdmin || (currentUserEmail && exp.user?.email === currentUserEmail);

  const splitPreview = (amount, participants) => {
    const n = participants?.length || allParticipantEmails.length || 1;
    const total = Number(amount) || 0;
    return n > 0 ? total / n : total;
  };

  const createExpense = async () => {
    if (!newExpense.title || !newExpense.amount) {
      toast.error("Title and amount are required");
      return;
    }

    try {
      const res = await api.post(
        `${BASE}/rooms/${roomId}/expenses`,
        {
          ...newExpense,
          splitAmong: allParticipantEmails,
        },
        { headers: authHeaders }
      );

      setExpenses((prev) => [res.data.expense, ...prev]);
      setNewExpense({ title: "", amount: "", category: "", date: "" });
      setShowAddExpense(false);
      toast.success("Expense added");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add expense");
    }
  };

  const openEditExpense = (exp) => {
    if (!canEditExpense(exp)) return;
    setEditingExpense(exp);
    setEditForm({
      title: exp.title || "",
      amount: exp.amount ?? "",
      category: exp.category || "",
      date: exp.date ? exp.date.slice(0, 10) : "",
      splitAmong:
        exp.splitAmong && exp.splitAmong.length
          ? exp.splitAmong
          : allParticipantEmails,
    });
  };

  const toggleEditSplitMember = (email) => {
    setEditForm((prev) => {
      const has = prev.splitAmong.includes(email);
      const next = has
        ? prev.splitAmong.filter((e) => e !== email)
        : [...prev.splitAmong, email];
      return { ...prev, splitAmong: next };
    });
  };

  const updateExpense = async () => {
    if (!editingExpense) return;
    if (!editForm.title || !editForm.amount) {
      toast.error("Title and amount are required");
      return;
    }
    if (isAdmin && editForm.splitAmong.length === 0) {
      toast.error("Pick at least one member to split with");
      return;
    }

    try {
      const res = await api.put(
        `${BASE}/rooms/${roomId}/expenses/${editingExpense._id}`,
        {
          title: editForm.title,
          amount: editForm.amount,
          category: editForm.category,
          date: editForm.date,
          splitAmong: editForm.splitAmong,
        },
        { headers: authHeaders }
      );

      setExpenses((prev) =>
        prev.map((e) => (e._id === editingExpense._id ? res.data.expense : e))
      );
      setEditingExpense(null);
      toast.success("Expense updated");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update expense");
    }
  };

  const deleteExpense = async (exp) => {
    if (!canEditExpense(exp)) return;
    if (!window.confirm(`Delete "${exp.title}"? This can't be undone.`)) return;

    try {
      await api.delete(`${BASE}/rooms/${roomId}/expenses/${exp._id}`, {
        headers: authHeaders,
      });
      setExpenses((prev) => prev.filter((e) => e._id !== exp._id));
      toast.success("Expense deleted");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete expense");
    }
  };

  const addMember = async () => {
    if (!newMemberEmail.trim()) return;

    try {
      const res = await api.post(
        `${BASE}/rooms/${roomId}/members`,
        { email: newMemberEmail.trim() },
        { headers: authHeaders }
      );

      setRoom(res.data.room);
      setNewMemberEmail("");
      toast.success("Member added");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add member");
    }
  };

  const removeMember = async (email) => {
    try {
      const res = await api.delete(
        `${BASE}/rooms/${roomId}/members/${encodeURIComponent(email)}`,
        { headers: authHeaders }
      );

      setRoom(res.data.room);
      toast.success("Member removed");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading room...
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
        <Lock className="text-red-500" size={40} />
        <h1 className="text-xl font-bold">Access denied</h1>
        <p className="text-gray-500">
          You're not a member of this room. Ask the admin to add your email.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
        <AlertCircle className="text-red-500" size={40} />
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <ToastContainer />
      <div className="max-w-6xl mx-auto">
        {/* header */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{room.name}</h1>
            <p className="text-gray-500">
              {room.members.length + 1} members · रु {formatAmount(roomTotal)} total
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddExpense(true)}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <Plus size={16} /> Add Expense
            </button>

            {isAdmin && (
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
              >
                <UserPlus size={16} /> Member
              </button>
            )}
          </div>
        </div>

        {/* member list (admin only) */}
        {isAdmin && (
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <h2 className="font-semibold mb-3">Members</h2>
            <div className="space-y-2">
              {room.members.map((m) => (
                <div
                  key={m.email}
                  className="flex justify-between items-center text-sm border-b pb-2"
                >
                  <span>
                    {m.email}{" "}
                    <span
                      className={`ml-2 text-xs px-2 py-0.5 rounded ${
                        m.status === "joined"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {m.status}
                    </span>
                  </span>
                  <button
                    onClick={() => removeMember(m.email)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {room.members.length === 0 && (
                <p className="text-sm text-gray-400">No members yet.</p>
              )}
            </div>
          </div>
        )}


        {summaries.length === 0 ? (
          <div className="text-center py-10">
            <Receipt className="mx-auto text-blue-500" />
            <p>No expenses yet in this room.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
              {summaries.map((user) => (
                <div key={user.email} className="bg-white rounded-xl shadow p-4 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 shrink-0 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                      {initials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-semibold truncate">{user.name}</h2>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between gap-2">
                    <div>
                      <p className="text-xs text-gray-400">Entries</p>
                      <h3 className="text-xl font-bold">{user.count}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total</p>
                      <h3 className="text-lg font-bold text-blue-600">
                        रु {formatAmount(user.total)}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* individual expenses - everyone can see all of them, but can
                only edit/delete their own (admin can edit/delete any) */}
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Receipt size={18} className="text-blue-600" /> All Expenses
              </h2>
              <div className="space-y-2">
                {expenses.map((exp) => {
                  const participants =
                    exp.splitAmong && exp.splitAmong.length
                      ? exp.splitAmong
                      : allParticipantEmails;
                  const perPerson = splitPreview(exp.amount, participants);
                  const editable = canEditExpense(exp);

                  return (
                    <div
                      key={exp._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 text-sm"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{exp.title}</span>
                          {exp.category && (
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                              {exp.category}
                            </span>
                          )}
                          {exp.user?.email === currentUserEmail && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Added by {exp.user?.name || "Unknown"}
                          {exp.date ? ` · ${exp.date.slice(0, 10)}` : ""}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Users size={12} /> Split {participants.length} ways ·
                          रु {formatAmount(perPerson)} each
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-blue-600">
                          रु {formatAmount(exp.amount)}
                        </span>
                        {editable && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditExpense(exp)}
                              className="text-gray-500 hover:text-blue-600"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => deleteExpense(exp)}
                              className="text-gray-500 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* add expense modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-sm relative">
            <button
              onClick={() => setShowAddExpense(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">Add Expense</h2>

            <input
              className="border w-full p-2 mb-3 rounded"
              placeholder="Title"
              value={newExpense.title}
              onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
            />
            <input
              type="number"
              className="border w-full p-2 mb-3 rounded"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            />
            <input
              className="border w-full p-2 mb-3 rounded"
              placeholder="Category"
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            />
            <input
              type="date"
              className="border w-full p-2 mb-3 rounded"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
            />

            {allParticipantEmails.length > 0 && (
              <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                <Users size={12} /> Split equally among {allParticipantEmails.length}{" "}
                member{allParticipantEmails.length === 1 ? "" : "s"}
                {newExpense.amount
                  ? ` · रु ${formatAmount(
                      splitPreview(newExpense.amount, allParticipantEmails)
                    )} each`
                  : ""}
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowAddExpense(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={createExpense}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* edit expense modal - owner or admin */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-sm relative">
            <button
              onClick={() => setEditingExpense(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">Edit Expense</h2>

            <input
              className="border w-full p-2 mb-3 rounded"
              placeholder="Title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
            <input
              type="number"
              className="border w-full p-2 mb-3 rounded"
              placeholder="Amount"
              value={editForm.amount}
              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
            />
            <input
              className="border w-full p-2 mb-3 rounded"
              placeholder="Category"
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
            />
            <input
              type="date"
              className="border w-full p-2 mb-3 rounded"
              value={editForm.date}
              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
            />

            {isAdmin ? (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Split among
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto border rounded p-2">
                  {allParticipantEmails.map((email) => (
                    <label key={email} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editForm.splitAmong.includes(email)}
                        onChange={() => toggleEditSplitMember(email)}
                      />
                      {email}
                    </label>
                  ))}
                </div>
                {editForm.amount && editForm.splitAmong.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    रु {formatAmount(splitPreview(editForm.amount, editForm.splitAmong))}{" "}
                    each across {editForm.splitAmong.length} member
                    {editForm.splitAmong.length === 1 ? "" : "s"}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                <Users size={12} /> Split equally among {editForm.splitAmong.length}{" "}
                member{editForm.splitAmong.length === 1 ? "" : "s"}
                {editForm.amount
                  ? ` · रु ${formatAmount(
                      splitPreview(editForm.amount, editForm.splitAmong)
                    )} each`
                  : ""}
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() => setEditingExpense(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={updateExpense}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* add member modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-sm relative">
            <button
              onClick={() => setShowAddMember(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">Add Member</h2>

            <input
              type="email"
              className="border w-full p-2 mb-4 rounded"
              placeholder="member@email.com"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
            />

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowAddMember(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={addMember}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}