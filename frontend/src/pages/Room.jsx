import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Plus,
  Users,
  Receipt,
  Wallet,
  UserPlus,
  X,
  Calendar,
  ChevronDown,
  Split,
  Trash2,
  Loader2,
  Search,
  Utensils,
  Car,
  ShoppingBag,
  FileText,
  Gamepad2,
  MoreHorizontal,
  ShieldCheck,
} from "lucide-react";

const API = "https://daybook-j903.onrender.com/api";

const categories = [
  {
    name: "Food",
    icon: Utensils,
  },
  {
    name: "Travel",
    icon: Car,
  },
  {
    name: "Shopping",
    icon: ShoppingBag,
  },
  {
    name: "Bills",
    icon: FileText,
  },
  {
    name: "Entertainment",
    icon: Gamepad2,
  },
  {
    name: "Others",
    icon: MoreHorizontal,
  },
];

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString("en-NP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function getCategoryIcon(category) {
  const found = categories.find((item) => item.name === category);

  if (!found) return MoreHorizontal;

  return found.icon;
}

export default function Room() {
  const { id, roomId } = useParams();
  const currentRoomId = roomId || id;

  const navigate = useNavigate();
  const dateRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const [search, setSearch] = useState("");

  const [memberEmail, setMemberEmail] = useState("");

  const [expense, setExpense] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
    split: false,
    splitMembers: [],
  });

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // -----------------------------------------
  // BODY SCROLL LOCK
  // -----------------------------------------

  useEffect(() => {
    const modalOpen = showExpenseModal || showMemberModal;

    document.body.style.overflow = modalOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showExpenseModal, showMemberModal]);

  // -----------------------------------------
  // LOAD ROOM
  // -----------------------------------------

  const loadRoom = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `${API}/rooms/${currentRoomId}`,
        authConfig
      );

      setRoom(response.data.room);
    } catch (error) {
      console.error(error.response?.data || error.message);

      toast.error(
        error.response?.data?.message || "Failed to load room"
      );

      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // LOAD MEMBERS
  // -----------------------------------------

  const loadMembers = async () => {
    try {
      const response = await api.get(
        `${API}/rooms/${currentRoomId}/members`,
        authConfig
      );

      setMembers(response.data.members || []);
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  // -----------------------------------------
  // LOAD EXPENSES
  // -----------------------------------------

  const loadExpenses = async () => {
    try {
      setExpenseLoading(true);

      const response = await api.get(
        `${API}/rooms/${currentRoomId}/expenses`,
        authConfig
      );

      setExpenses(response.data.expenses || []);
    } catch (error) {
      console.error(error.response?.data || error.message);

      // If your backend currently uses /api/expenses
      // you can change the endpoint here.
      setExpenses([]);
    } finally {
      setExpenseLoading(false);
    }
  };

  useEffect(() => {
    if (!currentRoomId) {
      navigate("/dashboard");
      return;
    }

    loadRoom();
    loadMembers();
    loadExpenses();
  }, [currentRoomId]);

  // -----------------------------------------
  // ADMIN CHECK
  // -----------------------------------------

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const isAdmin = useMemo(() => {
    if (!room || !currentUser?._id) return false;

    const adminId =
      typeof room.admin === "object"
        ? room.admin?._id
        : room.admin;

    return adminId === currentUser._id;
  }, [room, currentUser?._id]);

  // -----------------------------------------
  // EXPENSE CHANGE
  // -----------------------------------------

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;

    setExpense((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -----------------------------------------
  // DATE PICKER
  // -----------------------------------------

  const openDatePicker = () => {
    if (dateRef.current?.showPicker) {
      dateRef.current.showPicker();
    } else {
      dateRef.current?.focus();
    }
  };

  // -----------------------------------------
  // SPLIT TOGGLE
  // -----------------------------------------

  const handleSplitToggle = () => {
    setExpense((prev) => ({
      ...prev,
      split: !prev.split,
      splitMembers: !prev.split
        ? members.map((member) => member.email)
        : [],
    }));
  };

  // -----------------------------------------
  // SELECT SPLIT MEMBER
  // -----------------------------------------

  const toggleSplitMember = (email) => {
    setExpense((prev) => {
      const exists = prev.splitMembers.includes(email);

      return {
        ...prev,
        splitMembers: exists
          ? prev.splitMembers.filter((item) => item !== email)
          : [...prev.splitMembers, email],
      };
    });
  };

  // -----------------------------------------
  // ADD EXPENSE
  // -----------------------------------------

  const handleSubmitExpense = async (e) => {
    e.preventDefault();

    if (!expense.title.trim()) {
      toast.error("Please enter expense title");
      return;
    }

    if (!expense.amount || Number(expense.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!expense.category) {
      toast.error("Please select a category");
      return;
    }

    if (!expense.date) {
      toast.error("Please select a date");
      return;
    }

    if (
      expense.split &&
      expense.splitMembers.length === 0
    ) {
      toast.error("Select at least one member for split");
      return;
    }

    try {
      setExpenseLoading(true);

      const payload = {
        title: expense.title.trim(),
        amount: Number(expense.amount),
        category: expense.category,
        date: expense.date,

        roomId: currentRoomId,

        split: expense.split,

        splitMembers: expense.split
          ? expense.splitMembers
          : [],
      };

      const response = await api.post(
        `${API}/rooms/${currentRoomId}/expenses`,
        payload,
        authConfig
      );

      const createdExpense =
        response.data.expense || response.data;

      setExpenses((prev) => [
        createdExpense,
        ...prev,
      ]);

      setExpense({
        title: "",
        amount: "",
        category: "",
        date: "",
        split: false,
        splitMembers: [],
      });

      setShowExpenseModal(false);

      toast.success("Expense added successfully");
    } catch (error) {
      console.error(
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to add expense"
      );
    } finally {
      setExpenseLoading(false);
    }
  };

  // -----------------------------------------
  // ADD MEMBER
  // -----------------------------------------

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!memberEmail.trim()) {
      toast.error("Enter member email");
      return;
    }

    if (!memberEmail.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }

    try {
      setMemberLoading(true);

      const response = await api.post(
        `${API}/rooms/${currentRoomId}/members`,
        {
          email: memberEmail.trim().toLowerCase(),
        },
        authConfig
      );

      if (response.data.room) {
        setRoom(response.data.room);
      }

      await loadMembers();

      setMemberEmail("");
      setShowMemberModal(false);

      toast.success("Member added successfully");
    } catch (error) {
      console.error(
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to add member"
      );
    } finally {
      setMemberLoading(false);
    }
  };

  // -----------------------------------------
  // REMOVE MEMBER
  // -----------------------------------------

  const handleRemoveMember = async (email) => {
    if (!isAdmin) {
      toast.error("Only admin can remove members");
      return;
    }

    const confirmRemove = window.confirm(
      `Remove ${email} from this room?`
    );

    if (!confirmRemove) return;

    try {
      await api.delete(
        `${API}/rooms/${currentRoomId}/members`,
        {
          ...authConfig,
          data: {
            email,
          },
        }
      );

      await loadMembers();

      toast.success("Member removed successfully");
    } catch (error) {
      console.error(
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to remove member"
      );
    }
  };

  // -----------------------------------------
  // DELETE EXPENSE
  // -----------------------------------------

  const handleDeleteExpense = async (expenseId) => {
    if (!isAdmin) {
      toast.error("Only admin can delete expenses");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `${API}/rooms/${currentRoomId}/expenses/${expenseId}`,
        authConfig
      );

      setExpenses((prev) =>
        prev.filter((item) => item._id !== expenseId)
      );

      toast.success("Expense deleted");
    } catch (error) {
      console.error(
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete expense"
      );
    }
  };

  // -----------------------------------------
  // FILTER EXPENSES
  // -----------------------------------------

  const filteredExpenses = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return expenses;

    return expenses.filter((item) => {
      return (
        item.title?.toLowerCase().includes(value) ||
        item.category?.toLowerCase().includes(value) ||
        item.createdBy?.name
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [expenses, search]);

  // -----------------------------------------
  // TOTAL
  // -----------------------------------------

  const totalExpense = useMemo(() => {
    return expenses.reduce(
      (total, item) => total + Number(item.amount || 0),
      0
    );
  }, [expenses]);

  const averageExpense = useMemo(() => {
    if (!expenses.length) return 0;

    return totalExpense / expenses.length;
  }, [totalExpense, expenses.length]);

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7f3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#637b55]" />
          <p className="text-gray-500">
            Loading room...
          </p>
        </div>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  const adminName =
    typeof room.admin === "object"
      ? room.admin?.name
      : "Room Admin";

  const adminEmail =
    typeof room.admin === "object"
      ? room.admin?.email
      : "";

  return (
    <div className="min-h-screen bg-[#f5f7f3] text-gray-800">
      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[72px] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                  {room.name}
                </h1>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 sm:text-sm">
                  <ShieldCheck
                    size={14}
                    className="text-[#637b55]"
                  />

                  <span className="truncate">
                    Admin: {adminName}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => setShowMemberModal(true)}
                  className="hidden items-center gap-2 rounded-xl bg-[#637b55] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#536947] sm:flex"
                >
                  <UserPlus size={18} />
                  Add Member
                </button>
              )}

              <button
                onClick={() => setShowExpenseModal(true)}
                className="flex items-center gap-2 rounded-xl bg-[#334e35] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#263c28]"
              >
                <Plus size={18} />

                <span className="hidden sm:inline">
                  Add Expense
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* MOBILE ADMIN BUTTON */}

        {isAdmin && (
          <button
            onClick={() => setShowMemberModal(true)}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#637b55]/30 bg-white px-4 py-3 text-sm font-semibold text-[#536947] shadow-sm sm:hidden"
          >
            <UserPlus size={18} />
            Add Member
          </button>
        )}

        {/* ================= STATS ================= */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Total */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Expenses
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                  Rs. {formatAmount(totalExpense)}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf3e9] text-[#637b55]">
                <Wallet size={22} />
              </div>
            </div>
          </div>

          {/* Count */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Transactions
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                  {expenses.length}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Receipt size={22} />
              </div>
            </div>
          </div>

          {/* Average */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Average Expense
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                  Rs. {formatAmount(averageExpense)}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Split size={22} />
              </div>
            </div>
          </div>
        </section>

        {/* ================= CONTENT ================= */}

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* ================= EXPENSES ================= */}

          <div className="min-w-0 rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Room Expenses
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Track all expenses shared in this room
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#637b55] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto md:block">
              {expenseLoading ? (
                <div className="flex min-h-[250px] items-center justify-center">
                  <Loader2
                    className="animate-spin text-[#637b55]"
                    size={28}
                  />
                </div>
              ) : filteredExpenses.length === 0 ? (
                <EmptyExpenses
                  onAdd={() => setShowExpenseModal(true)}
                />
              ) : (
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70 text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-5 py-3 font-semibold">
                        Expense
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Category
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Date
                      </th>

                      <th className="px-5 py-3 text-right font-semibold">
                        Amount
                      </th>

                      {isAdmin && (
                        <th className="px-5 py-3 text-right">
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredExpenses.map((item) => {
                      const Icon = getCategoryIcon(
                        item.category
                      );

                      return (
                        <tr
                          key={item._id}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3e9] text-[#637b55]">
                                <Icon size={19} />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-gray-900">
                                  {item.title}
                                </p>

                                {item.createdBy?.name && (
                                  <p className="mt-0.5 text-xs text-gray-500">
                                    Added by{" "}
                                    {item.createdBy.name}
                                  </p>
                                )}

                                {item.split && (
                                  <div className="mt-1 flex items-center gap-1 text-xs text-purple-600">
                                    <Split size={12} />
                                    Split expense
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                              {item.category}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-500">
                            {formatDate(item.date)}
                          </td>

                          <td className="px-5 py-4 text-right font-bold text-gray-900">
                            Rs. {formatAmount(item.amount)}
                          </td>

                          {isAdmin && (
                            <td className="px-5 py-4 text-right">
                              <button
                                onClick={() =>
                                  handleDeleteExpense(
                                    item._id
                                  )
                                }
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                              >
                                <Trash2 size={17} />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* MOBILE EXPENSE CARDS */}

            <div className="space-y-3 p-4 md:hidden">
              {expenseLoading ? (
                <div className="flex min-h-[250px] items-center justify-center">
                  <Loader2
                    className="animate-spin text-[#637b55]"
                    size={28}
                  />
                </div>
              ) : filteredExpenses.length === 0 ? (
                <EmptyExpenses
                  onAdd={() => setShowExpenseModal(true)}
                />
              ) : (
                filteredExpenses.map((item) => {
                  const Icon = getCategoryIcon(
                    item.category
                  );

                  return (
                    <div
                      key={item._id}
                      className="rounded-xl border border-gray-100 bg-gray-50/50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3e9] text-[#637b55]">
                            <Icon size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">
                              {item.title}
                            </p>

                            <p className="text-xs text-gray-500">
                              {formatDate(item.date)}
                            </p>
                          </div>
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() =>
                              handleDeleteExpense(
                                item._id
                              )
                            }
                            className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-600">
                            {item.category}
                          </span>

                          {item.split && (
                            <span className="flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-600">
                              <Split size={12} />
                              Split
                            </span>
                          )}
                        </div>

                        <p className="font-bold text-gray-900">
                          Rs. {formatAmount(item.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ================= MEMBERS ================= */}

          <aside className="h-fit rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="font-bold text-gray-900">
                  Members
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {members.length + 1} people
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3e9] text-[#637b55]">
                <Users size={19} />
              </div>
            </div>

            <div className="max-h-[430px] space-y-2 overflow-y-auto p-4">
              {/* ADMIN */}

              <div className="flex items-center gap-3 rounded-xl bg-[#f5f8f3] p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#637b55] text-sm font-bold text-white">
                  {getInitials(adminName)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {adminName}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {adminEmail}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-[#637b55]/10 px-2 py-1 text-[10px] font-bold uppercase text-[#637b55]">
                  Admin
                </span>
              </div>

              {/* MEMBERS */}

              {members.map((member, index) => {
                const memberName =
                  member.user?.name ||
                  member.email?.split("@")[0] ||
                  "Member";

                return (
                  <div
                    key={
                      member.user?._id ||
                      member.email ||
                      index
                    }
                    className="group flex items-center gap-3 rounded-xl p-3 transition hover:bg-gray-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                      {getInitials(memberName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {memberName}
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        {member.email}
                      </p>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() =>
                          handleRemoveMember(
                            member.email
                          )
                        }
                        className="rounded-lg p-2 text-gray-300 opacity-100 transition hover:bg-red-50 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                );
              })}

              {members.length === 0 && (
                <div className="py-8 text-center">
                  <Users
                    size={28}
                    className="mx-auto text-gray-300"
                  />

                  <p className="mt-2 text-sm text-gray-500">
                    No members added yet
                  </p>
                </div>
              )}
            </div>
          </aside>
        </section>
      </main>

      {/* ======================================================
          ADD EXPENSE MODAL
      ====================================================== */}

      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">
            {/* Modal header */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Add Expense
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Add an expense to {room.name}
                </p>
              </div>

              <button
                onClick={() =>
                  setShowExpenseModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmitExpense}
              className="space-y-5 p-5 sm:p-6"
            >
              {/* Title */}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Expense Title
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Monthly groceries"
                  value={expense.title}
                  onChange={handleExpenseChange}
                  minLength={2}
                  maxLength={50}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#637b55] focus:bg-white"
                />
              </div>

              {/* Amount */}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Amount
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                    Rs.
                  </span>

                  <input
                    type="number"
                    name="amount"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={expense.amount}
                    onChange={handleExpenseChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-[#637b55] focus:bg-white"
                  />
                </div>
              </div>

              {/* Category */}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Category
                </label>

                <div className="relative">
                  <select
                    name="category"
                    value={expense.category}
                    onChange={handleExpenseChange}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm outline-none transition focus:border-[#637b55] focus:bg-white"
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.name}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              {/* Date */}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Date
                </label>

                <div
                  className="relative cursor-pointer"
                  onClick={openDatePicker}
                >
                  <input
                    ref={dateRef}
                    type="date"
                    name="date"
                    value={expense.date}
                    onChange={handleExpenseChange}
                    max={
                      new Date(
                        Date.now() -
                          new Date().getTimezoneOffset() *
                            60000
                      )
                        .toISOString()
                        .split("T")[0]
                    }
                    className="w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#637b55] focus:bg-white"
                    style={{
                      colorScheme: "light",
                    }}
                  />

                  <Calendar
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              {/* SPLIT */}

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                      <Split size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        Split this expense
                      </p>

                      <p className="text-xs text-gray-500">
                        Share this expense with members
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSplitToggle}
                    className={`relative h-6 w-11 rounded-full transition ${
                      expense.split
                        ? "bg-[#637b55]"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                        expense.split
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* MEMBER SELECTION */}

                {expense.split && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Split with
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setExpense((prev) => ({
                            ...prev,
                            splitMembers:
                              members.map(
                                (member) =>
                                  member.email
                              ),
                          }))
                        }
                        className="text-xs font-semibold text-[#637b55]"
                      >
                        Select all
                      </button>
                    </div>

                    <div className="max-h-40 space-y-2 overflow-y-auto">
                      {/* Current user */}

                      <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-white p-3">
                        <input
                          type="checkbox"
                          checked={expense.splitMembers.includes(
                            currentUser.email
                          )}
                          onChange={() =>
                            toggleSplitMember(
                              currentUser.email
                            )
                          }
                          className="h-4 w-4 accent-[#637b55]"
                        />

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#637b55] text-xs font-bold text-white">
                          {getInitials(
                            currentUser.name ||
                              currentUser.email
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {currentUser.name ||
                              "You"}
                          </p>

                          <p className="truncate text-xs text-gray-400">
                            {currentUser.email}
                          </p>
                        </div>

                        <span className="ml-auto text-xs text-gray-400">
                          You
                        </span>
                      </label>

                      {members.map((member) => (
                        <label
                          key={member.email}
                          className="flex cursor-pointer items-center gap-3 rounded-xl bg-white p-3"
                        >
                          <input
                            type="checkbox"
                            checked={expense.splitMembers.includes(
                              member.email
                            )}
                            onChange={() =>
                              toggleSplitMember(
                                member.email
                              )
                            }
                            className="h-4 w-4 accent-[#637b55]"
                          />

                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                            {getInitials(
                              member.user?.name ||
                                member.email
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {member.user?.name ||
                                member.email.split(
                                  "@"
                                )[0]}
                            </p>

                            <p className="truncate text-xs text-gray-400">
                              {member.email}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>

                    {expense.amount &&
                      expense.splitMembers.length >
                        0 && (
                        <div className="mt-3 rounded-xl bg-purple-50 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-purple-600">
                              Each person pays
                            </span>

                            <span className="font-bold text-purple-700">
                              Rs.{" "}
                              {formatAmount(
                                Number(
                                  expense.amount
                                ) /
                                  expense
                                    .splitMembers
                                    .length
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* BUTTONS */}

              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowExpenseModal(false)
                  }
                  className="w-full rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-200 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={expenseLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#334e35] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#263c28] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {expenseLoading && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          ADD MEMBER MODAL
      ====================================================== */}

      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Add Member
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Add a registered user to this room
                </p>
              </div>

              <button
                onClick={() =>
                  setShowMemberModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleAddMember}
              className="space-y-5 p-5 sm:p-6"
            >
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Member Email
                </label>

                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) =>
                    setMemberEmail(e.target.value)
                  }
                  placeholder="member@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#637b55] focus:bg-white"
                  autoFocus
                />

                <p className="mt-2 text-xs text-gray-400">
                  The user must already have an account.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowMemberModal(false)
                  }
                  className="w-full rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-200 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={memberLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#637b55] px-6 py-3 text-sm font-semibold text-white hover:bg-[#536947] disabled:opacity-60 sm:w-auto"
                >
                  {memberLoading && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  <UserPlus size={17} />

                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   EMPTY EXPENSES
============================================================ */

function EmptyExpenses({ onAdd }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf3e9] text-[#637b55]">
        <Receipt size={26} />
      </div>

      <h3 className="mt-4 font-bold text-gray-900">
        No expenses yet
      </h3>

      <p className="mt-1 max-w-xs text-sm text-gray-500">
        Add your first room expense to start tracking
        shared spending.
      </p>

      <button
        onClick={onAdd}
        className="mt-5 flex items-center gap-2 rounded-xl bg-[#334e35] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#263c28]"
      >
        <Plus size={17} />
        Add Expense
      </button>
    </div>
  );
}