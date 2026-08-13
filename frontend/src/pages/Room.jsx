import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const API = "https://daybook-j903.onrender.com/api";

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const currentUserId =
    currentUser._id || currentUser.id;

  const isAdmin = currentUser.role === "admin";

  const [room, setRoom] = useState(null);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [expenseLoading, setExpenseLoading] = useState(false);

  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const [editingExpense, setEditingExpense] = useState(null);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
    split: false,
    splitMembers: [],
  });

  const [roomLoading, setRoomLoading] = useState(false);

  // ==================================================
  // AXIOS CONFIG
  // ==================================================

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ==================================================
  // LOAD ROOM
  // ==================================================

  const fetchRoom = async () => {
    try {
      const response = await axios.get(
        `${API}/rooms/${roomId}`,
        config
      );

      setRoom(response.data.room);
    } catch (error) {
      console.error(
        "ROOM ERROR:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load room"
      );
    }
  };

  // ==================================================
  // LOAD EXPENSES
  // ==================================================

  const fetchExpenses = async () => {
    try {
      setExpenseLoading(true);

      const response = await axios.get(
        `${API}/rooms/${roomId}/expenses`,
        config
      );

      setExpenses(response.data.expenses || []);
    } catch (error) {
      console.error(
        "EXPENSE ERROR:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load expenses"
      );
    } finally {
      setExpenseLoading(false);
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    if (!roomId) {
      navigate("/room");
      return;
    }

    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchRoom(),
        fetchExpenses(),
      ]);

      setLoading(false);
    };

    loadData();
  }, [roomId]);

  // ==================================================
  // FORM CHANGE
  // ==================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ==================================================
  // SPLIT MEMBER SELECT
  // ==================================================

  const handleMemberToggle = (memberId) => {
    setForm((prev) => {
      const exists =
        prev.splitMembers.includes(memberId);

      return {
        ...prev,
        splitMembers: exists
          ? prev.splitMembers.filter(
              (id) => id !== memberId
            )
          : [...prev.splitMembers, memberId],
      };
    });
  };

  // ==================================================
  // RESET FORM
  // ==================================================

  const resetForm = () => {
    setForm({
      title: "",
      amount: "",
      category: "",
      date: "",
      split: false,
      splitMembers: [],
    });

    setEditingExpense(null);
    setShowExpenseForm(false);
  };

  // ==================================================
  // CREATE / UPDATE EXPENSE
  // ==================================================

  const handleSubmitExpense = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Enter expense title");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    if (!form.category.trim()) {
      alert("Enter category");
      return;
    }

    if (!form.date) {
      alert("Select date");
      return;
    }

    if (
      form.split &&
      form.splitMembers.length === 0
    ) {
      alert("Select at least one member");
      return;
    }

    try {
      setExpenseLoading(true);

      const data = {
        title: form.title.trim(),
        amount: Number(form.amount),
        category: form.category.trim(),
        date: form.date,
        split: form.split,
        splitMembers: form.split
          ? form.splitMembers
          : [],
      };

      if (editingExpense) {
        await axios.put(
          `${API}/rooms/${roomId}/expenses/${editingExpense._id}`,
          data,
          config
        );

        alert("Expense updated successfully");
      } else {
        await axios.post(
          `${API}/rooms/${roomId}/expenses`,
          data,
          config
        );

        alert("Expense added successfully");
      }

      resetForm();

      await fetchExpenses();
    } catch (error) {
      console.error(
        "SAVE EXPENSE ERROR:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Unable to save expense"
      );
    } finally {
      setExpenseLoading(false);
    }
  };

  // ==================================================
  // EDIT EXPENSE
  // ==================================================

  const handleEdit = (expense) => {
    setEditingExpense(expense);

    setForm({
      title: expense.title || "",
      amount: expense.amount || "",
      category: expense.category || "",
      date: expense.date
        ? new Date(expense.date)
            .toISOString()
            .split("T")[0]
        : "",
      split: expense.split || false,
      splitMembers:
        expense.splitMembers?.map(
          (member) =>
            typeof member === "string"
              ? member
              : member._id
        ) || [],
    });

    setShowExpenseForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==================================================
  // DELETE EXPENSE
  // ==================================================

  const handleDelete = async (expense) => {
    const confirmed = window.confirm(
      `Delete "${expense.title}"?`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API}/rooms/${roomId}/expenses/${expense._id}`,
        config
      );

      alert("Expense deleted");

      await fetchExpenses();
    } catch (error) {
      console.error(
        "DELETE ERROR:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Unable to delete expense"
      );
    }
  };

  // ==================================================
  // CHECK PERMISSION
  // ==================================================

  const canModifyExpense = (expense) => {
    if (isAdmin) return true;

    const creatorId =
      expense.createdBy?._id ||
      expense.createdBy;

    return (
      String(creatorId) ===
      String(currentUserId)
    );
  };

  // ==================================================
  // CALCULATE SPLIT
  // ==================================================

  const getSplitAmount = () => {
    if (
      !form.split ||
      form.splitMembers.length === 0
    ) {
      return 0;
    }

    return (
      Number(form.amount) /
      form.splitMembers.length
    );
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">
          Loading room...
        </p>
      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-xl bg-red-50 p-5 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  // ==================================================
  // ROOM NOT FOUND
  // ==================================================

  if (!room) {
    return (
      <div className="p-6">
        Room not found.
      </div>
    );
  }

  // ==================================================
  // ALL USERS
  // ==================================================

  const allUsers = [
    room.admin,
    ...(room.members || []),
  ];

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">

      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            {room.name}
          </h1>

          <p className="mt-1 text-gray-500">
            Shared Expense Room
          </p>
        </div>

        <button
          onClick={() =>
            setShowExpenseForm(
              !showExpenseForm
            )
          }
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          {showExpenseForm
            ? "Close"
            : "+ Add Expense"}
        </button>
      </div>

      {/* ========================================= */}
      {/* EXPENSE FORM */}
      {/* ========================================= */}

      {showExpenseForm && (
        <div className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-xl font-bold">
              {editingExpense
                ? "Edit Expense"
                : "Add Room Expense"}
            </h2>

            <p className="text-sm text-gray-500">
              Add an expense for everyone in
              this room.
            </p>
          </div>

          <form
            onSubmit={handleSubmitExpense}
            className="space-y-5"
          >

            {/* TITLE */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Title
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Dinner"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* AMOUNT */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Amount
              </label>

              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="1000"
                min="1"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>

              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Food"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* DATE */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Date
              </label>

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* SPLIT TOGGLE */}

            <div className="rounded-xl border bg-gray-50 p-4">

              <div className="flex items-center justify-between">

                <div>
                  <p className="font-semibold">
                    Split expense
                  </p>

                  <p className="text-sm text-gray-500">
                    Divide this expense between
                    room members.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      split: !prev.split,
                    }))
                  }
                  className={`relative h-7 w-12 rounded-full transition ${
                    form.split
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                      form.split
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>

              </div>

              {/* SPLIT USERS */}

              {form.split && (
                <div className="mt-5">

                  <p className="mb-3 text-sm font-medium">
                    Split with
                  </p>

                  <div className="space-y-2">

                    {allUsers.map((user) => {
                      const userId = user._id;

                      const selected =
                        form.splitMembers.includes(
                          userId
                        );

                      return (
                        <label
                          key={userId}
                          className="flex cursor-pointer items-center justify-between rounded-lg border bg-white p-3"
                        >

                          <div>
                            <p className="font-medium">
                              {user.username}
                            </p>

                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>

                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() =>
                              handleMemberToggle(
                                userId
                              )
                            }
                            className="h-5 w-5"
                          />

                        </label>
                      );
                    })}

                  </div>

                  {/* SPLIT CALCULATION */}

                  {form.splitMembers.length >
                    0 && (
                    <div className="mt-4 rounded-lg bg-blue-50 p-4">

                      <p className="text-sm text-blue-700">
                        Each selected user pays
                      </p>

                      <p className="text-2xl font-bold text-blue-700">
                        Rs.{" "}
                        {getSplitAmount().toFixed(
                          2
                        )}
                      </p>

                      <p className="text-xs text-blue-600">
                        {form.splitMembers.length}{" "}
                        users selected
                      </p>

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* BUTTONS */}

            <div className="flex gap-3">

              <button
                type="submit"
                disabled={expenseLoading}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {expenseLoading
                  ? "Saving..."
                  : editingExpense
                  ? "Update Expense"
                  : "Add Expense"}
              </button>

              {editingExpense && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border px-6 py-3"
                >
                  Cancel
                </button>
              )}

            </div>

          </form>
        </div>
      )}

      {/* ========================================= */}
      {/* MEMBERS */}
      {/* ========================================= */}

      <div className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">

        <h2 className="mb-5 text-xl font-bold">
          Members
        </h2>

        {/* ADMIN */}

        <div className="mb-3 flex items-center justify-between rounded-lg bg-gray-50 p-4">

          <div>
            <p className="font-semibold">
              {room.admin?.username}
            </p>

            <p className="text-sm text-gray-500">
              {room.admin?.email}
            </p>
          </div>

          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
            Admin
          </span>

        </div>

        {/* MEMBERS */}

        {(room.members || []).map(
          (member) => (
            <div
              key={member._id}
              className="mb-3 flex items-center justify-between rounded-lg border p-4"
            >

              <div>
                <p className="font-semibold">
                  {member.username}
                </p>

                <p className="text-sm text-gray-500">
                  {member.email}
                </p>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                Member
              </span>

            </div>
          )
        )}

      </div>

      {/* ========================================= */}
      {/* EXPENSES */}
      {/* ========================================= */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-xl font-bold">
            Room Expenses
          </h2>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
            {expenses.length} expenses
          </span>

        </div>

        {expenseLoading &&
          expenses.length === 0 && (
            <p className="py-10 text-center text-gray-500">
              Loading expenses...
            </p>
          )}

        {!expenseLoading &&
          expenses.length === 0 && (
            <div className="rounded-xl bg-gray-50 p-10 text-center">

              <p className="font-medium">
                No expenses yet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Add the first room expense.
              </p>

            </div>
          )}

        <div className="space-y-4">

          {expenses.map((expense) => {

            const creator =
              expense.createdBy;

            const canModify =
              canModifyExpense(expense);

            return (
              <div
                key={expense._id}
                className="rounded-xl border p-5"
              >

                {/* EXPENSE HEADER */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div>

                    <h3 className="text-lg font-bold">
                      {expense.title}
                    </h3>

                    <p className="text-sm text-gray-500">
                      Added by{" "}
                      <span className="font-medium">
                        {creator?.username ||
                          "Unknown"}
                      </span>
                    </p>

                  </div>

                  <p className="text-2xl font-bold">
                    Rs.{" "}
                    {Number(
                      expense.amount
                    ).toFixed(2)}
                  </p>

                </div>

                {/* DETAILS */}

                <div className="mt-4 flex flex-wrap gap-2">

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                    {expense.category}
                  </span>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                    {new Date(
                      expense.date
                    ).toLocaleDateString()}
                  </span>

                  {expense.split && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">
                      Split
                    </span>
                  )}

                </div>

                {/* SPLIT DETAILS */}

                {expense.split &&
                  expense.splitMembers?.length >
                    0 && (
                    <div className="mt-5 rounded-lg bg-blue-50 p-4">

                      <p className="mb-3 font-semibold text-blue-800">
                        Split Details
                      </p>

                      <div className="space-y-2">

                        {expense.splitMembers.map(
                          (member) => {

                            const memberId =
                              member._id ||
                              member;

                            const splitAmount =
                              Number(
                                expense.amount
                              ) /
                              expense.splitMembers
                                .length;

                            return (
                              <div
                                key={memberId}
                                className="flex items-center justify-between"
                              >

                                <span className="text-sm">
                                  {member.username ||
                                    "Member"}
                                </span>

                                <span className="font-semibold">
                                  Rs.{" "}
                                  {splitAmount.toFixed(
                                    2
                                  )}
                                </span>

                              </div>
                            );
                          }
                        )}

                      </div>

                    </div>
                  )}

                {/* ACTIONS */}

                {canModify && (
                  <div className="mt-5 flex gap-2 border-t pt-4">

                    <button
                      onClick={() =>
                        handleEdit(expense)
                      }
                      className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(expense)
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Delete
                    </button>

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