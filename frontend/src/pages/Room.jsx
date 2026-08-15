import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const API = "https://daybook-j903.onrender.com/api";

const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Utilities",
  "Rent",
  "Entertainment",
  "Shopping",
  "Other",
];

const TODAY = new Date().toISOString().slice(0, 10);

// =====================================================
// HELPERS
// =====================================================

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-teal-500",
];

const getAvatarColor = (id = "") => {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toInputDate = (value) => {
  if (!value) return TODAY;

  return String(value).slice(0, 10);
};

// =====================================================
// SPLIT CALCULATION
// =====================================================

const buildSplitUsers = (userIds, totalAmount) => {
  const count = userIds.length;

  if (count === 0) return [];

  const rawShare = Math.floor((totalAmount / count) * 100) / 100;

  const shareSoFar = Number(
    (rawShare * (count - 1)).toFixed(2)
  );

  return userIds.map((userId, index) => {
    const isLast = index === count - 1;

    const amount = isLast
      ? Number((totalAmount - shareSoFar).toFixed(2))
      : rawShare;

    return {
      userId,
      amount,
    };
  });
};

// =====================================================
// COMPONENT
// =====================================================

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // ROOM STATES
  // =====================================================

  const [room, setRoom] = useState(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [roomName, setRoomName] = useState("");

  // =====================================================
  // MEMBER STATES
  // =====================================================

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(null);
  const [removing, setRemoving] = useState(null);

  // =====================================================
  // EXPENSE STATES
  // =====================================================

  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);

  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    category: EXPENSE_CATEGORIES[0],
    date: TODAY,
  });

  const [submittingExpense, setSubmittingExpense] =
    useState(false);

  const [expenseError, setExpenseError] = useState("");

  // Everyone selected internally by default
  const [splitWith, setSplitWith] = useState([]);

  // UI toggle OFF by default
  const [showSplitToggle, setShowSplitToggle] =
    useState(false);

  // =====================================================
  // EDIT EXPENSE
  // =====================================================

  const [editingExpenseId, setEditingExpenseId] =
    useState(null);

  const [editForm, setEditForm] = useState({
    title: "",
    amount: "",
    category: EXPENSE_CATEGORIES[0],
    date: TODAY,
  });

  const [editSplitWith, setEditSplitWith] = useState([]);

  const [editShowSplitToggle, setEditShowSplitToggle] =
    useState(false);

  const [editError, setEditError] = useState("");

  const [updatingExpense, setUpdatingExpense] =
    useState(false);

  const [deletingExpenseId, setDeletingExpenseId] =
    useState(null);

  // =====================================================
  // GENERAL
  // =====================================================

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const currentUserId =
    currentUser._id || currentUser.id;

  const isAdmin = currentUser.role === "admin";

  // =====================================================
  // ALL PEOPLE IN ROOM
  // =====================================================

  const allPeople = room
    ? [
        room.admin && {
          _id: room.admin._id,
          name:
            room.admin.name ||
            room.admin.username ||
            "Unknown",
          email: room.admin.email,
          role: "admin",
        },

        ...(room.members || []).map((member) => ({
          _id: member._id,
          name:
            member.name ||
            member.username ||
            "Unknown",
          email: member.email,
          role: "member",
        })),
      ].filter(Boolean)
    : [];

  const totalPeople = allPeople.length;

  // =====================================================
  // FIND PERSON
  // =====================================================

  const findPerson = (id) =>
    allPeople.find((person) => person._id === id);

  // =====================================================
  // TOTAL SPENDING BY USER
  //
  // This calculates how much each person has personally
  // added as an expense.
  // =====================================================

  const spendingByUser = useMemo(() => {
    const totals = {};

    // Start every person with 0
    allPeople.forEach((person) => {
      totals[person._id] = 0;
    });

    // Add expense amount to creator
    expenses.forEach((expense) => {
      const creatorId =
        expense.createdBy?._id ||
        expense.createdBy;

      if (!creatorId) return;

      totals[creatorId] =
        (totals[creatorId] || 0) +
        Number(expense.amount || 0);
    });

    return totals;
  }, [expenses, allPeople]);

  // =====================================================
  // TOTAL ROOM SPENDING
  // =====================================================

  const totalRoomSpending = useMemo(() => {
    return expenses.reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );
  }, [expenses]);

  // =====================================================
  // LOAD ROOM
  // =====================================================

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setLoading(true);
        setError("");

        if (roomId) {
          const response = await axios.get(
            `${API}/rooms/${roomId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setRoom(response.data.room);
          return;
        }

        try {
          const response = await axios.get(
            `${API}/rooms/my-room`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setRoom(response.data.room);
        } catch (error) {
          if (error.response?.status === 404) {
            setRoom(null);
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error(
          "ROOM ERROR:",
          error.response?.data || error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load room"
        );
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [roomId, token]);

  // =====================================================
  // LOAD EXPENSES
  // =====================================================

  useEffect(() => {
    const loadExpenses = async () => {
      if (!roomId) return;

      try {
        setExpensesLoading(true);

        const response = await axios.get(
          `${API}/rooms/${roomId}/expenses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setExpenses(
          Array.isArray(response.data.expenses)
            ? response.data.expenses
            : []
        );
      } catch (error) {
        console.error(
          "EXPENSES ERROR:",
          error.response?.data || error
        );
      } finally {
        setExpensesLoading(false);
      }
    };

    loadExpenses();
  }, [roomId, token]);

  // =====================================================
  // DEFAULT SPLIT
  //
  // Everyone is selected.
  // UI toggle is OFF.
  // =====================================================

  useEffect(() => {
    if (room && allPeople.length > 0) {
      setSplitWith(
        allPeople.map((person) => person._id)
      );

      setShowSplitToggle(false);
    }
  }, [room?._id]);

  // =====================================================
  // CREATE ROOM
  // =====================================================

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    if (!isAdmin) return;

    if (!roomName.trim()) {
      setError("Enter room name");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await axios.post(
        `${API}/rooms`,
        {
          name: roomName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newRoom = response.data.room;

      navigate(`/room/${newRoom._id}`);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to create room"
      );
    } finally {
      setCreating(false);
    }
  };

  // =====================================================
  // SEARCH USERS
  // =====================================================

  const handleSearchUsers = async (e) => {
    const value = e.target.value;

    setSearch(value);
    setMessage("");

    if (!value.trim()) {
      setUsers([]);
      return;
    }

    if (!isAdmin) return;

    try {
      setSearching(true);

      const response = await axios.get(
        `${API}/rooms/users/search?search=${encodeURIComponent(
          value
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(response.data.users || []);
    } catch (error) {
      console.error(
        "SEARCH USERS ERROR:",
        error.response?.data || error
      );

      setUsers([]);

      setMessage(
        error.response?.data?.message ||
          "Unable to search users"
      );
    } finally {
      setSearching(false);
    }
  };

  // =====================================================
  // ADD MEMBER
  // =====================================================

  const handleAddMember = async (userId) => {
    if (!isAdmin || !roomId) return;

    try {
      setAdding(userId);
      setMessage("");

      const response = await axios.post(
        `${API}/rooms/${roomId}/members`,
        {
          userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRoom(response.data.room);

      setSearch("");
      setUsers([]);

      setMessage("Member added successfully");
    } catch (error) {
      console.error(
        "ADD MEMBER ERROR:",
        error.response?.data || error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to add member"
      );
    } finally {
      setAdding(null);
    }
  };

  // =====================================================
  // REMOVE MEMBER
  // =====================================================

  const handleRemoveMember = async (
    userId,
    name
  ) => {
    if (!isAdmin || !roomId) return;

    const confirmed = window.confirm(
      `Remove ${name} from this room?`
    );

    if (!confirmed) return;

    try {
      setRemoving(userId);
      setMessage("");

      const response = await axios.delete(
        `${API}/rooms/${roomId}/members/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRoom(response.data.room);

      setMessage(
        "Member removed successfully"
      );
    } catch (error) {
      console.error(
        "REMOVE MEMBER ERROR:",
        error.response?.data || error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to remove member"
      );
    } finally {
      setRemoving(null);
    }
  };

  // =====================================================
  // DELETE ROOM
  // =====================================================

  const handleDeleteRoom = async () => {
    if (!room || !isAdmin) return;

    const confirmed = window.confirm(
      `Delete "${room.name}" permanently?`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API}/rooms/${room._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Room deleted successfully");

      setRoom(null);

      navigate("/room");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Unable to delete room"
      );
    }
  };

  // =====================================================
  // SPLIT MEMBER TOGGLE
  // =====================================================

  const toggleSplitMember = (userId) => {
    setSplitWith((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // =====================================================
  // EXPENSE FIELD CHANGE
  // =====================================================

  const handleExpenseFieldChange =
    (field) => (e) => {
      setExpenseForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  // =====================================================
  // ADD EXPENSE
  // =====================================================

  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (!roomId) return;

    const trimmedTitle =
      expenseForm.title.trim();

    const parsedAmount =
      parseFloat(expenseForm.amount);

    if (!trimmedTitle) {
      setExpenseError("Enter a title");
      return;
    }

    if (!parsedAmount || parsedAmount <= 0) {
      setExpenseError("Enter a valid amount");
      return;
    }

    if (!expenseForm.date) {
      setExpenseError("Select a date");
      return;
    }

    if (expenseForm.date > TODAY) {
      setExpenseError(
        "Date cannot be in the future"
      );
      return;
    }

    if (splitWith.length === 0) {
      setExpenseError(
        "Select at least one person to split with"
      );
      return;
    }

    try {
      setSubmittingExpense(true);
      setExpenseError("");

      const splitUsers = buildSplitUsers(
        splitWith,
        parsedAmount
      );

      const response = await axios.post(
        `${API}/rooms/${roomId}/expenses`,
        {
          title: trimmedTitle,
          amount: parsedAmount,
          category: expenseForm.category,
          date: expenseForm.date,
          splitUsers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newExpense =
        response.data.expense;

      const enrichedExpense = {
        ...newExpense,

        createdBy:
          newExpense.createdBy ||
          currentUser,

        splitUsers:
          newExpense.splitUsers?.map((s) => {
            const rawId =
              s.user?._id || s.user;

            const person = findPerson(rawId);

            return {
              ...s,

              user: {
                _id: rawId,

                name:
                  person?.name ||
                  s.user?.name ||
                  s.user?.username ||
                  "Unknown",

                email:
                  person?.email ||
                  s.user?.email ||
                  "",
              },
            };
          }),
      };

      setExpenses((prev) => [
        enrichedExpense,
        ...prev,
      ]);

      setExpenseForm({
        title: "",
        amount: "",
        category:
          EXPENSE_CATEGORIES[0],
        date: TODAY,
      });

      // Everyone selected again
      setSplitWith(
        allPeople.map(
          (person) => person._id
        )
      );

      // Toggle remains OFF
      setShowSplitToggle(false);
    } catch (error) {
      console.error(
        "ADD EXPENSE ERROR:",
        error.response?.data || error
      );

      setExpenseError(
        error.response?.data?.message ||
          "Unable to add expense"
      );
    } finally {
      setSubmittingExpense(false);
    }
  };

  // =====================================================
  // PREVIEW SPLIT
  // =====================================================

  const previewAmount =
    parseFloat(expenseForm.amount);

  const previewSplit =
    splitWith.length > 0 &&
    previewAmount > 0
      ? (
          previewAmount /
          splitWith.length
        ).toFixed(2)
      : null;

  // =====================================================
  // EDIT / DELETE PERMISSIONS
  // =====================================================

  const canManageExpense = (expense) => {
    const creatorId =
      expense.createdBy?._id ||
      expense.createdBy;

    return (
      isAdmin ||
      creatorId === currentUserId
    );
  };

  // =====================================================
  // CREATOR NAME
  // =====================================================

  const getCreatorName = (expense) => {
    if (expense.createdBy?.name) {
      return expense.createdBy.name;
    }

    if (
      typeof expense.createdBy === "string" ||
      expense.createdBy?._id
    ) {
      const creatorId =
        expense.createdBy?._id ||
        expense.createdBy;

      const person = findPerson(creatorId);

      if (person?.name) {
        return person.name;
      }
    }

    if (expense.createdBy?.email) {
      return expense.createdBy.email;
    }

    return "Unknown";
  };

  // =====================================================
  // CREATOR EMAIL
  // =====================================================

  const getCreatorEmail = (expense) => {
    if (expense.createdBy?.email) {
      return expense.createdBy.email;
    }

    const creatorId =
      expense.createdBy?._id ||
      expense.createdBy;

    if (creatorId) {
      const person = findPerson(creatorId);

      return person?.email || "";
    }

    return "";
  };

  // =====================================================
  // START EDIT
  // =====================================================

  const startEditExpense = (expense) => {
    setEditingExpenseId(expense._id);

    setEditError("");

    setEditForm({
      title: expense.title,
      amount: String(expense.amount),
      category: expense.category,
      date: toInputDate(expense.date),
    });

    setEditSplitWith(
      (expense.splitUsers || []).map(
        (s) => s.user?._id || s.user
      )
    );

    // OFF by default
    setEditShowSplitToggle(false);
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const cancelEditExpense = () => {
    setEditingExpenseId(null);
    setEditError("");
  };

  // =====================================================
  // EDIT SPLIT TOGGLE
  // =====================================================

  const toggleEditSplitMember = (userId) => {
    setEditSplitWith((prev) =>
      prev.includes(userId)
        ? prev.filter(
            (id) => id !== userId
          )
        : [...prev, userId]
    );
  };

  // =====================================================
  // EDIT FIELD CHANGE
  // =====================================================

  const handleEditFieldChange =
    (field) => (e) => {
      setEditForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  // =====================================================
  // UPDATE EXPENSE
  // =====================================================

  const handleUpdateExpense = async (
    e,
    expenseId
  ) => {
    e.preventDefault();

    const trimmedTitle =
      editForm.title.trim();

    const parsedAmount =
      parseFloat(editForm.amount);

    if (!trimmedTitle) {
      setEditError("Enter a title");
      return;
    }

    if (!parsedAmount || parsedAmount <= 0) {
      setEditError("Enter a valid amount");
      return;
    }

    if (!editForm.date) {
      setEditError("Select a date");
      return;
    }

    if (editForm.date > TODAY) {
      setEditError(
        "Date cannot be in the future"
      );
      return;
    }

    if (editSplitWith.length === 0) {
      setEditError(
        "Select at least one person to split with"
      );
      return;
    }

    try {
      setUpdatingExpense(true);
      setEditError("");

      const splitUsers = buildSplitUsers(
        editSplitWith,
        parsedAmount
      );

      const response = await axios.put(
        `${API}/rooms/${roomId}/expenses/${expenseId}`,
        {
          title: trimmedTitle,
          amount: parsedAmount,
          category: editForm.category,
          date: editForm.date,
          splitUsers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedExpense =
        response.data.expense;

      const enrichedExpense = {
        ...updatedExpense,

        splitUsers:
          updatedExpense.splitUsers?.map(
            (s) => {
              const rawId =
                s.user?._id || s.user;

              const person =
                findPerson(rawId);

              return {
                ...s,

                user: {
                  _id: rawId,

                  name:
                    person?.name ||
                    s.user?.name ||
                    "Unknown",

                  email:
                    person?.email ||
                    s.user?.email ||
                    "",
                },
              };
            }
          ),
      };

      setExpenses((prev) =>
        prev.map((expense) =>
          expense._id === expenseId
            ? enrichedExpense
            : expense
        )
      );

      setEditingExpenseId(null);
      setEditShowSplitToggle(false);
    } catch (error) {
      console.error(
        "UPDATE EXPENSE ERROR:",
        error.response?.data || error
      );

      setEditError(
        error.response?.data?.message ||
          "Unable to update expense"
      );
    } finally {
      setUpdatingExpense(false);
    }
  };

  // =====================================================
  // DELETE EXPENSE
  // =====================================================

  const handleDeleteExpense = async (
    expenseId
  ) => {
    const confirmed = window.confirm(
      "Delete this expense permanently?"
    );

    if (!confirmed) return;

    try {
      setDeletingExpenseId(expenseId);

      await axios.delete(
        `${API}/rooms/${roomId}/expenses/${expenseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExpenses((prev) =>
        prev.filter(
          (expense) =>
            expense._id !== expenseId
        )
      );
    } catch (error) {
      console.error(
        "DELETE EXPENSE ERROR:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Unable to delete expense"
      );
    } finally {
      setDeletingExpenseId(null);
    }
  };

  // =====================================================
  // SPLIT LIST
  //
  // OFF -> completely hidden
  // ON  -> show members and switches
  // =====================================================

  const renderSplitToggleList = (
    selectedIds,
    onToggle,
    showToggle
  ) => {
    if (!showToggle) {
      return null;
    }

    return (
      <div className="max-h-64 divide-y overflow-y-auto rounded-xl border">
        {allPeople.map((person) => {
          const checked =
            selectedIds.includes(person._id);

          return (
            <div
              key={person._id}
              className="flex flex-wrap items-center justify-between gap-3 p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${getAvatarColor(
                    person._id
                  )}`}
                >
                  {getInitials(person.name)}
                </div>

                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium text-gray-800">
                    <span className="truncate">
                      {person.name}
                    </span>

                    {person.role === "admin" && (
                      <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                        Admin
                      </span>
                    )}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {person.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={`Include ${person.name} in split`}
                onClick={() =>
                  onToggle(person._id)
                }
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 ${
                  checked
                    ? "bg-indigo-600"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    checked
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6 text-sm text-gray-500 sm:text-base">
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          Loading room...
        </span>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="mx-auto max-w-2xl p-4 text-center text-sm text-red-500 sm:p-6 sm:text-base">
        {error}
      </div>
    );
  }

  // =====================================================
  // ROOM CARD
  // =====================================================

  if (room && !roomId) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {room.name}
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Your shared expense room
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() =>
                navigate(`/room/${room._id}`)
              }
              className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white transition-colors hover:bg-indigo-700 sm:w-auto"
            >
              Enter Room
            </button>

            {isAdmin && (
              <button
                onClick={handleDeleteRoom}
                className="w-full rounded-lg bg-red-600 px-5 py-3 font-medium text-white transition-colors hover:bg-red-700 sm:w-auto"
              >
                Delete Room
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // NO ROOM
  // =====================================================

  if (!room && !roomId) {
    if (!isAdmin) {
      return (
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-12">
  <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-8">
    
    {/* Decorative background */}
    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-50" />
    <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-indigo-50" />

    {/* Icon */}
    <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 16.5v-9z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 9h18"
        />
      </svg>
    </div>

    <div className="relative">
      <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        No Room Found
      </h1>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500 sm:text-base">
        You are not a member of any room yet.Contact with Admin
      </p>
    </div>
  </div>
</div>
      );
    }

    return (
      <div className="mx-auto max-w-lg p-4 sm:p-6">
        <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-6">
          <h1 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
            Create Room
          </h1>

          <p className="mb-6 text-sm text-gray-500 sm:text-base">
            Create a room for your members.
          </p>

          <form onSubmit={handleCreateRoom}>
            <input
              value={roomName}
              onChange={(e) =>
                setRoomName(e.target.value)
              }
              placeholder="Room name"
              className="mb-4 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 sm:text-base"
            />

            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 sm:text-base"
            >
              {creating
                ? "Creating..."
                : "Create Room"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =====================================================
  // ACTUAL ROOM
  // =====================================================

  return (
    <div className="mx-auto max-w-4xl p-3 sm:p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-4 flex flex-col gap-1 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-5 text-white shadow-md sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold sm:text-3xl">
            {room.name}
          </h1>

          <p className="text-xs text-indigo-100 sm:text-base">
            Shared Expense Room · {totalPeople} member
            {totalPeople === 1 ? "" : "s"}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleDeleteRoom}
            className="w-full shrink-0 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/30 backdrop-blur transition-colors hover:bg-white/25 sm:w-auto sm:text-base"
          >
            Delete Room
          </button>
        )}
      </div>

      {/* =====================================================
          ADD MEMBER
      ===================================================== */}

      {isAdmin && (
        <div className="mb-4 rounded-2xl border bg-white p-4 shadow-sm sm:mb-6 sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900 sm:text-xl">
            Add Member
          </h2>

          <p className="mb-4 text-sm text-gray-500">
            Search for an existing user and add them to this room.
          </p>

          <input
            type="text"
            value={search}
            onChange={handleSearchUsers}
            placeholder="Search name or email..."
            className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 sm:text-base"
          />

          {searching && (
            <p className="mt-3 text-sm text-gray-500">
              Searching...
            </p>
          )}

          {users.length > 0 && (
            <div className="mt-3 divide-y overflow-hidden rounded-lg border">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${getAvatarColor(
                        user._id
                      )}`}
                    >
                      {getInitials(user.name)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">
                        {user.name}
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleAddMember(user._id)
                    }
                    disabled={
                      adding === user._id
                    }
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 sm:w-auto"
                  >
                    {adding === user._id
                      ? "Adding..."
                      : "Add"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {search &&
            !searching &&
            users.length === 0 && (
              <p className="mt-3 text-sm text-gray-500">
                No users found.
              </p>
            )}

          {message && (
            <p className="mt-3 text-sm text-green-600">
              {message}
            </p>
          )}
        </div>
      )}

      {/* =====================================================
          MEMBERS
      ===================================================== */}

      <div className="mb-4 rounded-2xl border bg-white p-4 shadow-sm sm:mb-6 sm:p-6">
        <h2 className="mb-5 text-base font-semibold text-gray-900 sm:text-xl">
          Members ({totalPeople})
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          {/* ADMIN */}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-3 sm:p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${getAvatarColor(
                  room.admin?._id
                )}`}
              >
                {getInitials(
                  room.admin?.name ||
                    room.admin?.username
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">
                  {room.admin?.name ||
                    room.admin?.username}
                </p>

                <p className="truncate text-xs text-gray-500">
                  {room.admin?.email}
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
              Admin
            </span>
          </div>

          {/* MEMBERS */}

          {room.members?.map((member) => (
            <div
              key={member._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 sm:p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${getAvatarColor(
                    member._id
                  )}`}
                >
                  {getInitials(
                    member.name ||
                      member.username
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">
                    {member.name ||
                      member.username}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {member.email}
                  </p>
                </div>
              </div>

              <div className="flex w-fit items-center gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                  Member
                </span>

                {isAdmin && (
                  <button
                    onClick={() =>
                      handleRemoveMember(
                        member._id,
                        member.name ||
                          member.username
                      )
                    }
                    disabled={
                      removing === member._id
                    }
                    className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                  >
                    {removing === member._id
                      ? "Removing..."
                      : "Remove"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {(!room.members ||
          room.members.length === 0) && (
          <p className="py-8 text-center text-sm text-gray-500 sm:text-base">
            No members yet.
          </p>
        )}
      </div>

      {/* =====================================================
          TOTAL SPENT
      ===================================================== */}

      <div className="mb-4 rounded-2xl border bg-white p-4 shadow-sm sm:mb-6 sm:p-6">

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 sm:text-xl">
              Total Spent
            </h2>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Amount added by each member
            </p>
          </div>

          <div className="rounded-xl bg-emerald-50 px-4 py-2 text-left sm:text-right">
            <p className="text-xs text-emerald-700">
              Room Total
            </p>

            <p className="text-lg font-bold text-emerald-700">
              रु {totalRoomSpending.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          {allPeople.map((person) => {
            const total =
              spendingByUser[person._id] || 0;

            return (
              <div
                key={person._id}
                className="flex items-center justify-between rounded-xl border bg-gray-50 p-3 sm:p-4"
              >
                <div className="flex min-w-0 items-center gap-3">

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${getAvatarColor(
                      person._id
                    )}`}
                  >
                    {getInitials(person.name)}
                  </div>

                  <div className="min-w-0">

                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                        {person.name}
                      </p>

                      {person.role ===
                        "admin" && (
                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                          Admin
                        </span>
                      )}
                    </div>

                    <p className="truncate text-xs text-gray-500">
                      {person.email}
                    </p>
                  </div>
                </div>

                <div className="ml-3 shrink-0 text-right">
                  <p className="text-base font-bold text-emerald-600 sm:text-lg">
                    रु {total.toFixed(2)}
                  </p>

                  <p className="text-[10px] text-gray-500 sm:text-xs">
                    total added
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =====================================================
          EXPENSES
      ===================================================== */}

      <div className="mb-4 rounded-2xl border bg-white p-4 shadow-sm sm:mb-6 sm:p-6">

        <h2 className="mb-4 text-base font-semibold text-gray-900 sm:text-xl">
          Expenses
        </h2>

        {expensesLoading && (
          <p className="text-sm text-gray-500">
            Loading expenses...
          </p>
        )}

        {!expensesLoading &&
          expenses.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500 sm:text-base">
              No expenses yet. Add your first one below.
            </p>
          )}

        {!expensesLoading &&
          expenses.map((expense) => {
            const splitCount =
              expense.splitUsers?.length ||
              totalPeople;

            const isEditing =
              editingExpenseId ===
              expense._id;

            const canManage =
              canManageExpense(expense);

            const creatorName =
              getCreatorName(expense);

            const creatorEmail =
              getCreatorEmail(expense);

            return (
              <div
                key={expense._id}
                className="mb-3 rounded-xl border p-3 transition-shadow last:mb-0 hover:shadow-sm sm:p-4"
              >
                {!isEditing ? (
                  <>
                    {/* EXPENSE HEADER */}

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                            {expense.title}
                          </p>

                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                            {expense.category}
                          </span>
                        </div>

                        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                          {formatDate(
                            expense.date
                          )}{" "}
                          · Added by{" "}
                          <span className="font-medium text-gray-600">
                            {creatorName}
                          </span>

                          {creatorEmail && (
                            <>
                              {" "}
                              <span className="text-gray-400">
                                ·
                              </span>{" "}
                              <span className="text-gray-500">
                                {creatorEmail}
                              </span>
                            </>
                          )}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">

                        <p className="text-sm font-semibold text-gray-900 sm:text-base">
                          रु
                          {Number(
                            expense.amount
                          ).toFixed(2)}
                        </p>

                        <p className="text-xs text-gray-500 sm:text-sm">
                          split {splitCount} way
                          {splitCount === 1
                            ? ""
                            : "s"}
                        </p>
                      </div>
                    </div>

                    {/* SPLIT USERS */}

                    {expense.splitUsers?.length >
                      0 && (
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">

                        {expense.splitUsers.map(
                          (s) => {
                            const uid =
                              s.user?._id ||
                              s.user;

                            const person =
                              findPerson(uid);

                            const uname =
                              person?.name ||
                              s.user?.name ||
                              "Unknown";

                            const uemail =
                              person?.email ||
                              s.user?.email ||
                              "";

                            return (
                              <div
                                key={uid}
                                className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-600 ring-1 ring-gray-200"
                              >
                                <span className="flex min-w-0 items-center gap-1.5">

                                  <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white ${getAvatarColor(
                                      uid
                                    )}`}
                                  >
                                    {getInitials(
                                      uname
                                    )}
                                  </span>

                                  <span className="min-w-0 truncate">

                                    <span className="block truncate font-medium">
                                      {uname}
                                    </span>

                                    {uemail && (
                                      <span className="block truncate text-[10px] text-gray-500">
                                        {uemail}
                                      </span>
                                    )}
                                  </span>
                                </span>

                                <span className="shrink-0 font-semibold text-indigo-600">
                                  रु
                                  {Number(
                                    s.amount
                                  ).toFixed(2)}
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}

                    {/* ACTION BUTTONS */}

                    {canManage && (
                      <div className="mt-3 flex gap-2 border-t pt-3">

                        <button
                          onClick={() =>
                            startEditExpense(
                              expense
                            )
                          }
                          className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 sm:text-sm"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteExpense(
                              expense._id
                            )
                          }
                          disabled={
                            deletingExpenseId ===
                            expense._id
                          }
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 sm:text-sm"
                        >
                          {deletingExpenseId ===
                          expense._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  /* =================================================
                     EDIT FORM
                  ================================================= */

                  <form
                    onSubmit={(e) =>
                      handleUpdateExpense(
                        e,
                        expense._id
                      )
                    }
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                      {/* TITLE */}

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Title
                        </label>

                        <input
                          type="text"
                          value={editForm.title}
                          onChange={handleEditFieldChange(
                            "title"
                          )}
                          className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* AMOUNT */}

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Amount
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editForm.amount}
                          onChange={handleEditFieldChange(
                            "amount"
                          )}
                          className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* CATEGORY */}

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Category
                        </label>

                        <select
                          value={
                            editForm.category
                          }
                          onChange={handleEditFieldChange(
                            "category"
                          )}
                          className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {EXPENSE_CATEGORIES.map(
                            (category) => (
                              <option
                                key={category}
                                value={category}
                              >
                                {category}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      {/* DATE */}

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Date
                        </label>

                        <input
                          type="date"
                          value={toInputDate(
                            editForm.date
                          )}
                          max={TODAY}
                          onChange={handleEditFieldChange(
                            "date"
                          )}
                          className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* EDIT SPLIT */}

                    <div>
                      <div className="mb-2 flex items-center justify-between">

                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Split with
                          </p>

                          <p className="text-xs text-gray-500">
                            Turn on to choose members
                          </p>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={
                            editShowSplitToggle
                          }
                          onClick={() =>
                            setEditShowSplitToggle(
                              (prev) => !prev
                            )
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                            editShowSplitToggle
                              ? "bg-indigo-600"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              editShowSplitToggle
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      {renderSplitToggleList(
                        editSplitWith,
                        toggleEditSplitMember,
                        editShowSplitToggle
                      )}
                    </div>

                    {editError && (
                      <p className="text-xs text-red-500 sm:text-sm">
                        {editError}
                      </p>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row">

                      <button
                        type="submit"
                        disabled={
                          updatingExpense
                        }
                        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 sm:w-auto"
                      >
                        {updatingExpense
                          ? "Saving..."
                          : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        onClick={
                          cancelEditExpense
                        }
                        className="w-full rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 sm:w-auto"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
      </div>

      {/* =====================================================
          ADD EXPENSE
      ===================================================== */}

      <div className="mb-4 rounded-2xl border bg-white p-4 shadow-sm sm:mb-6 sm:p-6">

        <h2 className="mb-4 text-base font-semibold text-gray-900 sm:text-xl">
          Add Expense
        </h2>

        <form onSubmit={handleAddExpense}>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* TITLE */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Title
              </label>

              <input
                type="text"
                value={expenseForm.title}
                onChange={handleExpenseFieldChange(
                  "title"
                )}
                placeholder="e.g. Groceries"
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 sm:text-base"
              />
            </div>

            {/* AMOUNT */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={expenseForm.amount}
                onChange={handleExpenseFieldChange(
                  "amount"
                )}
                placeholder="0.00"
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 sm:text-base"
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Category
              </label>

              <select
                value={expenseForm.category}
                onChange={handleExpenseFieldChange(
                  "category"
                )}
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 sm:text-base"
              >
                {EXPENSE_CATEGORIES.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* DATE */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Date
              </label>

              <input
                type="date"
                value={toInputDate(
                  expenseForm.date
                )}
                max={TODAY}
                onChange={handleExpenseFieldChange(
                  "date"
                )}
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 sm:text-base"
              />
            </div>
          </div>

          {/* =================================================
              SPLIT WITH
          ================================================= */}

          <div className="mt-5">

            <div className="mb-3 flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-700">
                  Split with
                </p>

                <p className="text-xs text-gray-500">
                  Turn on to choose members
                </p>
              </div>

              {/* MAIN SPLIT TOGGLE */}

              <button
                type="button"
                role="switch"
                aria-checked={
                  showSplitToggle
                }
                onClick={() =>
                  setShowSplitToggle(
                    (prev) => !prev
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  showSplitToggle
                    ? "bg-indigo-600"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    showSplitToggle
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* MEMBER LIST ONLY WHEN ON */}

            {renderSplitToggleList(
              splitWith,
              toggleSplitMember,
              showSplitToggle
            )}
          </div>

          {/* =================================================
              SPLIT PREVIEW
          ================================================= */}

          {previewSplit && (
            <p className="mt-3 text-xs text-gray-600 sm:text-sm">
              Split:{" "}
              <span className="font-semibold text-indigo-600">
                रु {previewSplit}
              </span>{" "}
              per person among{" "}
              {splitWith.length} selected
            </p>
          )}

          {/* ERROR */}

          {expenseError && (
            <p className="mt-3 text-xs text-red-500 sm:text-sm">
              {expenseError}
            </p>
          )}

          {/* ADD BUTTON */}

          <button
            type="submit"
            disabled={submittingExpense}
            className="mt-4 w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 sm:w-auto sm:text-base"
          >
            {submittingExpense
              ? "Adding..."
              : "Add Expense"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Room;