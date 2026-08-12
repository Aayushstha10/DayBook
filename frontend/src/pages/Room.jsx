import React, { useEffect, useState } from "react";
import api from "../api";

const Room = () => {
  // ======================================================
  // ROOM
  // ======================================================

  const [room, setRoom] = useState(null);

  // ======================================================
  // EXPENSES
  // ======================================================

  const [expenses, setExpenses] = useState([]);

  // ======================================================
  // LOADING
  // ======================================================

  const [loading, setLoading] = useState(true);

  const [expenseLoading, setExpenseLoading] = useState(false);

  // ======================================================
  // ADD MEMBER MODAL
  // ======================================================

  const [showMemberModal, setShowMemberModal] = useState(false);

  const [search, setSearch] = useState("");

  const [users, setUsers] = useState([]);

  const [searchLoading, setSearchLoading] = useState(false);

  // ======================================================
  // EXPENSE FORM
  // ======================================================

  const [title, setTitle] = useState("");

  const [amount, setAmount] = useState("");

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [category, setCategory] = useState("");

  const [paidBy, setPaidBy] = useState("");

  const [selectedMembers, setSelectedMembers] = useState([]);

  // ======================================================
  // GET ROOM
  // ======================================================

  const fetchRoom = async () => {
    try {
      setLoading(true);

      const response = await api.get("/rooms/my");

      setRoom(response.data.room);

      // Default paid by current logged user
      const currentUser = JSON.parse(
        localStorage.getItem("user")
      );

      if (currentUser?._id) {
        setPaidBy(currentUser._id);
      }
    } catch (error) {
      console.error("ROOM ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load room"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // GET EXPENSES
  // ======================================================

  const fetchExpenses = async (roomId) => {
    try {
      const response = await api.get(
        `/rooms/${roomId}/expenses`
      );

      setExpenses(response.data.expenses || []);
    } catch (error) {
      console.error("EXPENSE ERROR:", error);

      setExpenses([]);

      alert(
        error.response?.data?.message ||
          "Failed to load expenses"
      );
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const response = await api.get("/rooms/my");

        const currentRoom = response.data.room;

        setRoom(currentRoom);

        const currentUser = JSON.parse(
          localStorage.getItem("user")
        );

        if (currentUser?._id) {
          setPaidBy(currentUser._id);

          setSelectedMembers([currentUser._id]);
        }

        await fetchExpenses(currentRoom._id);
      } catch (error) {
        console.error("LOAD ROOM ERROR:", error);

        setRoom(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ======================================================
  // ADMIN CHECK
  // ======================================================

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  const isAdmin =
    room &&
    currentUser &&
    room.admin?._id?.toString() ===
      currentUser?._id?.toString();

  // ======================================================
  // SEARCH USERS
  // ======================================================

  const handleSearchUsers = async () => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }

    try {
      setSearchLoading(true);

      const response = await api.get(
        `/users/search?search=${encodeURIComponent(search)}`
      );

      // Remove existing room members
      const existingMemberIds = room.members.map(
        (member) => member._id
      );

      const availableUsers = response.data.users.filter(
        (user) =>
          !existingMemberIds.includes(user._id)
      );

      setUsers(availableUsers);
    } catch (error) {
      console.error("SEARCH USER ERROR:", error);

      setUsers([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // ======================================================
  // ADD MEMBER
  // ======================================================

  const handleAddMember = async (userId) => {
    try {
      const response = await api.post(
        `/rooms/${room._id}/members`,
        {
          userId,
        }
      );

      setRoom(response.data.room);

      setSearch("");

      setUsers([]);

      alert("Member added successfully");
    } catch (error) {
      console.error("ADD MEMBER ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Failed to add member"
      );
    }
  };

  // ======================================================
  // REMOVE MEMBER
  // ======================================================

  const handleRemoveMember = async (userId) => {
    const confirmRemove = window.confirm(
      "Are you sure you want to remove this member?"
    );

    if (!confirmRemove) return;

    try {
      const response = await api.delete(
        `/rooms/${room._id}/members/${userId}`
      );

      setRoom(response.data.room);

      // Remove from selected split members
      setSelectedMembers((previous) =>
        previous.filter((id) => id !== userId)
      );

      alert("Member removed");
    } catch (error) {
      console.error("REMOVE MEMBER ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Failed to remove member"
      );
    }
  };

  // ======================================================
  // SELECT / UNSELECT SPLIT MEMBER
  // ======================================================

  const toggleMember = (userId) => {
    setSelectedMembers((previous) => {
      if (previous.includes(userId)) {
        return previous.filter(
          (id) => id !== userId
        );
      }

      return [...previous, userId];
    });
  };

  // ======================================================
  // CALCULATE SPLIT
  // ======================================================

  const calculateSplit = () => {
    const numericAmount = Number(amount);

    if (
      !numericAmount ||
      numericAmount <= 0 ||
      selectedMembers.length === 0
    ) {
      return [];
    }

    const share =
      numericAmount / selectedMembers.length;

    return selectedMembers.map((userId) => ({
      userId,
      amount: share,
    }));
  };

  // ======================================================
  // CREATE EXPENSE
  // ======================================================

  const handleCreateExpense = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter expense title");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Please enter valid amount");
      return;
    }

    if (!date) {
      alert("Please select date");
      return;
    }

    if (!category) {
      alert("Please select category");
      return;
    }

    if (!paidBy) {
      alert("Please select who paid");
      return;
    }

    if (selectedMembers.length === 0) {
      alert("Select at least one member to split");
      return;
    }

    try {
      setExpenseLoading(true);

      const response = await api.post(
        "/rooms/expenses",
        {
          roomId: room._id,

          title: title.trim(),

          amount: Number(amount),

          date,

          category,

          paidBy,

          splitUserIds: selectedMembers,
        }
      );

      // Add new expense at top
      setExpenses((previous) => [
        response.data.expense,
        ...previous,
      ]);

      // Clear form
      setTitle("");

      setAmount("");

      setCategory("");

      setDate(
        new Date().toISOString().split("T")[0]
      );

      // Keep current user as payer
      setSelectedMembers([paidBy]);

      alert("Expense added successfully");
    } catch (error) {
      console.error(
        "CREATE EXPENSE ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to create expense"
      );
    } finally {
      setExpenseLoading(false);
    }
  };

  // ======================================================
  // LOADING UI
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Loading room...
        </p>
      </div>
    );
  }

  // ======================================================
  // NO ROOM
  // ======================================================

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">
            No Room Found
          </h2>

          <p className="text-gray-600">
            You are not a member of any room yet.
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // SPLIT PREVIEW
  // ======================================================

  const splitPreview = calculateSplit();

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">

      <div className="max-w-6xl mx-auto">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {room.name}
              </h1>

              <p className="text-gray-500 mt-1">
                Shared room expenses
              </p>
            </div>

            <div className="bg-yellow-50 px-4 py-2 rounded-lg">
              👑 Admin:{" "}
              <strong>
                {room.admin?.username}
              </strong>
            </div>

          </div>

        </div>

        {/* ==================================================
            MEMBERS
        ================================================== */}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">

          <div className="flex items-center justify-between mb-4">

            <div>
              <h2 className="text-xl font-bold">
                Members
              </h2>

              <p className="text-gray-500 text-sm">
                {room.members.length} members
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() =>
                  setShowMemberModal(true)
                }
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                + Add Member
              </button>
            )}

          </div>

          <div className="space-y-3">

            {room.members.map((member) => {

              const memberIsAdmin =
                member._id === room.admin?._id;

              return (
                <div
                  key={member._id}
                  className="flex items-center justify-between border rounded-xl p-4"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      👤
                    </div>

                    <div>

                      <p className="font-semibold">
                        {member.username}
                      </p>

                      <p className="text-sm text-gray-500">
                        {member.email}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-3">

                    {memberIsAdmin && (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                        ADMIN
                      </span>
                    )}

                    {!memberIsAdmin && isAdmin && (
                      <button
                        onClick={() =>
                          handleRemoveMember(
                            member._id
                          )
                        }
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}

                  </div>

                </div>
              );
            })}

          </div>

        </div>

        {/* ==================================================
            EXPENSE FORM
        ================================================== */}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">

          <h2 className="text-xl font-bold mb-6">
            Add Expense
          </h2>

          <form
            onSubmit={handleCreateExpense}
            className="space-y-5"
          >

            {/* TITLE */}

            <div>

              <label className="block font-medium mb-2">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Dinner"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>

            {/* AMOUNT */}

            <div>

              <label className="block font-medium mb-2">
                Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                placeholder="2000"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>

            {/* DATE */}

            <div>

              <label className="block font-medium mb-2">
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>

            {/* CATEGORY */}

            <div>

              <label className="block font-medium mb-2">
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3"
              >

                <option value="">
                  Select category
                </option>

                <option value="Food">
                  Food
                </option>

                <option value="Travel">
                  Travel
                </option>

                <option value="Shopping">
                  Shopping
                </option>

                <option value="Entertainment">
                  Entertainment
                </option>

                <option value="Bills">
                  Bills
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

            {/* PAID BY */}

            <div>

              <label className="block font-medium mb-2">
                Paid By
              </label>

              <select
                value={paidBy}
                onChange={(e) =>
                  setPaidBy(e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3"
              >

                <option value="">
                  Select payer
                </option>

                {room.members.map((member) => (
                  <option
                    key={member._id}
                    value={member._id}
                  >
                    {member.username}
                  </option>
                ))}

              </select>

            </div>

            {/* SPLIT MEMBERS */}

            <div>

              <label className="block font-medium mb-3">
                Split Between
              </label>

              <div className="space-y-2">

                {room.members.map((member) => (

                  <label
                    key={member._id}
                    className="flex items-center justify-between border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                  >

                    <div className="flex items-center gap-3">

                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(
                          member._id
                        )}
                        onChange={() =>
                          toggleMember(
                            member._id
                          )
                        }
                        className="w-5 h-5"
                      />

                      <span>
                        {member.username}
                      </span>

                    </div>

                  </label>

                ))}

              </div>

            </div>

            {/* SPLIT PREVIEW */}

            {splitPreview.length > 0 && (
              <div className="bg-indigo-50 rounded-xl p-4">

                <h3 className="font-bold mb-3">
                  Split Preview
                </h3>

                <div className="space-y-2">

                  {splitPreview.map((split) => {

                    const member =
                      room.members.find(
                        (m) =>
                          m._id === split.userId
                      );

                    return (
                      <div
                        key={split.userId}
                        className="flex justify-between"
                      >

                        <span>
                          {member?.username}
                        </span>

                        <strong>
                          Rs.{" "}
                          {split.amount.toFixed(
                            2
                          )}
                        </strong>

                      </div>
                    );
                  })}

                </div>

                <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                  <span>Total</span>

                  <span>
                    Rs.{" "}
                    {Number(amount || 0).toFixed(
                      2
                    )}
                  </span>
                </div>

              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={expenseLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {expenseLoading
                ? "Adding Expense..."
                : "Add Expense"}
            </button>

          </form>

        </div>

        {/* ==================================================
            EXPENSE LIST
        ================================================== */}

        <div className="bg-white rounded-2xl shadow-sm p-6">

          <div className="mb-6">

            <h2 className="text-xl font-bold">
              Room Expenses
            </h2>

            <p className="text-gray-500 text-sm">
              All expenses created in this room
            </p>

          </div>

          {expenses.length === 0 ? (

            <div className="text-center py-10 text-gray-500">
              No expenses found.
            </div>

          ) : (

            <div className="space-y-5">

              {expenses.map((expense) => (

                <div
                  key={expense._id}
                  className="border rounded-xl p-5"
                >

                  {/* EXPENSE HEADER */}

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                    <div>

                      <h3 className="text-lg font-bold">
                        {expense.title}
                      </h3>

                      <p className="text-gray-500 text-sm">
                        {new Date(
                          expense.date
                        ).toLocaleDateString()}
                      </p>

                    </div>

                    <div className="text-xl font-bold text-indigo-600">
                      Rs.{" "}
                      {Number(
                        expense.amount
                      ).toFixed(2)}
                    </div>

                  </div>

                  {/* DETAILS */}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm">

                    <div className="bg-gray-50 rounded-lg p-3">

                      <span className="text-gray-500">
                        Category
                      </span>

                      <p className="font-semibold">
                        {expense.category}
                      </p>

                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">

                      <span className="text-gray-500">
                        Added By
                      </span>

                      <p className="font-semibold">
                        {expense.createdBy?.username}
                      </p>

                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">

                      <span className="text-gray-500">
                        Paid By
                      </span>

                      <p className="font-semibold">
                        {expense.paidBy?.username}
                      </p>

                    </div>

                  </div>

                  {/* SPLIT */}

                  <div className="mt-5">

                    <h4 className="font-semibold mb-3">
                      Split Between
                    </h4>

                    <div className="space-y-2">

                      {expense.splitBetween?.map(
                        (split) => (

                          <div
                            key={
                              split.user?._id
                            }
                            className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                          >

                            <span>
                              {split.user
                                ?.username}
                            </span>

                            <strong>
                              Rs.{" "}
                              {Number(
                                split.amount
                              ).toFixed(2)}
                            </strong>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

      {/* ====================================================
          ADD MEMBER MODAL
      ==================================================== */}

      {showMemberModal && isAdmin && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl w-full max-w-lg p-6">

            <div className="flex items-center justify-between mb-5">

              <h2 className="text-xl font-bold">
                Add Member
              </h2>

              <button
                onClick={() =>
                  setShowMemberModal(false)
                }
                className="text-gray-500 text-xl"
              >
                ✕
              </button>

            </div>

            {/* SEARCH */}

            <div className="flex gap-2 mb-5">

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchUsers();
                  }
                }}
                placeholder="Search username or email"
                className="flex-1 border rounded-lg px-4 py-3"
              />

              <button
                onClick={handleSearchUsers}
                className="bg-indigo-600 text-white px-4 rounded-lg"
              >
                Search
              </button>

            </div>

            {/* RESULTS */}

            {searchLoading && (
              <p className="text-gray-500">
                Searching...
              </p>
            )}

            {!searchLoading &&
              users.length === 0 &&
              search && (
                <p className="text-gray-500">
                  No available users found.
                </p>
              )}

            <div className="space-y-3 max-h-80 overflow-y-auto">

              {users.map((user) => (

                <div
                  key={user._id}
                  className="flex items-center justify-between border rounded-lg p-3"
                >

                  <div>

                    <p className="font-semibold">
                      {user.username}
                    </p>

                    <p className="text-sm text-gray-500">
                      {user.email}
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      handleAddMember(
                        user._id
                      )
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Add
                  </button>

                </div>

              ))}

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Room;