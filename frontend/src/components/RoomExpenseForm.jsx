import { useState } from "react";
import axios from "axios";

const API =
  "https://daybook-j903.onrender.com/api";

export default function RoomExpenseForm({
  room,
  token,
  onExpenseCreated,
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] =
    useState("Food");

  const [date, setDate] = useState(
    new Date()
      .toISOString()
      .split("T")[0]
  );

  const [selectedUsers, setSelectedUsers] =
    useState([]);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================
  // ADMIN + MEMBERS
  // ==========================================

  const users = [
    room.admin,
    ...(room.members || []),
  ];

  // ==========================================
  // TOGGLE USER
  // ==========================================

  const toggleUser = (user) => {
    setSelectedUsers((current) => {

      const exists = current.find(
        (item) =>
          item.userId === user._id
      );

      if (exists) {
        return current.filter(
          (item) =>
            item.userId !== user._id
        );
      }

      return [
        ...current,
        {
          userId: user._id,
          amount: 0,
        },
      ];
    });
  };

  // ==========================================
  // CHANGE SPLIT
  // ==========================================

  const changeSplitAmount = (
    userId,
    value
  ) => {
    setSelectedUsers((current) =>
      current.map((item) =>
        item.userId === userId
          ? {
              ...item,
              amount: Number(value),
            }
          : item
      )
    );
  };

  // ==========================================
  // CALCULATIONS
  // ==========================================

  const total =
    Number(amount) || 0;

  const splitTotal =
    selectedUsers.reduce(
      (sum, user) =>
        sum + Number(user.amount || 0),
      0
    );

  const remaining =
    total - splitTotal;

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Enter expense title");
      return;
    }

    if (total <= 0) {
      setError("Enter a valid amount");
      return;
    }

    if (selectedUsers.length === 0) {
      setError(
        "Select at least one person"
      );
      return;
    }

    if (
      Math.abs(remaining) > 0.01
    ) {
      setError(
        "Split amount must equal total amount"
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await axios.post(
          `${API}/rooms/${room._id}/expenses`,
          {
            title: title.trim(),

            amount: total,

            category,

            date,

            splitUsers:
              selectedUsers,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      // Reset

      setTitle("");
      setAmount("");
      setCategory("Food");

      setDate(
        new Date()
          .toISOString()
          .split("T")[0]
      );

      setSelectedUsers([]);

      if (onExpenseCreated) {
        onExpenseCreated(
          response.data.expense
        );
      }

    } catch (error) {
      console.error(
        error.response?.data ||
          error
      );

      setError(
        error.response?.data?.message ||
          "Unable to create expense"
      );

    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">

      <h2 className="mb-1 text-xl font-bold">
        Add Room Expense
      </h2>

      <p className="mb-6 text-sm text-gray-500">
        Create an expense and choose the
        split amount.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        {/* TITLE */}

        <div>
          <label className="mb-1 block text-sm font-medium">
            Title
          </label>

          <input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="Dinner"
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        {/* AMOUNT */}

        <div>
          <label className="mb-1 block text-sm font-medium">
            Total Amount
          </label>

          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            placeholder="3000"
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        {/* CATEGORY */}

        <div>
          <label className="mb-1 block text-sm font-medium">
            Category
          </label>

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="w-full rounded-lg border px-4 py-3"
          >
            <option>Food</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Entertainment</option>
            <option>Bills</option>
            <option>Other</option>
          </select>
        </div>

        {/* DATE */}

        <div>
          <label className="mb-1 block text-sm font-medium">
            Date
          </label>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        {/* SPLIT */}

        <div>

          <h3 className="mb-3 text-lg font-semibold">
            Split Amount
          </h3>

          <div className="space-y-3">

            {users.map((user) => {

              const selected =
                selectedUsers.find(
                  (item) =>
                    item.userId ===
                    user._id
                );

              const isAdmin =
                user._id ===
                room.admin?._id;

              return (
                <div
                  key={user._id}
                  className="flex items-center justify-between rounded-xl border p-4"
                >

                  <div className="flex items-center gap-3">

                    {/* TOGGLE */}

                    <button
                      type="button"
                      onClick={() =>
                        toggleUser(user)
                      }
                      className={`relative h-6 w-11 rounded-full ${
                        selected
                          ? "bg-blue-600"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                          selected
                            ? "left-6"
                            : "left-1"
                        }`}
                      />
                    </button>

                    <div>

                      <p className="font-medium">
                        {user.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {isAdmin
                          ? "Admin"
                          : "Member"}
                      </p>

                    </div>

                  </div>

                  {/* SPLIT AMOUNT */}

                  {selected && (
                    <div className="flex items-center">

                      <span className="mr-2 text-sm text-gray-500">
                        Rs.
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={
                          selected.amount
                        }
                        onChange={(e) =>
                          changeSplitAmount(
                            user._id,
                            e.target.value
                          )
                        }
                        className="w-28 rounded-lg border px-3 py-2 text-right"
                      />

                    </div>
                  )}

                </div>
              );
            })}

          </div>
        </div>

        {/* SUMMARY */}

        <div className="rounded-xl bg-gray-50 p-4">

          <div className="flex justify-between">
            <span>
              Total
            </span>

            <span className="font-semibold">
              Rs. {total.toFixed(2)}
            </span>
          </div>

          <div className="mt-2 flex justify-between">
            <span>
              Split
            </span>

            <span className="font-semibold">
              Rs. {splitTotal.toFixed(2)}
            </span>
          </div>

          <div
            className={`mt-2 flex justify-between font-semibold ${
              Math.abs(remaining) <
              0.01
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            <span>
              Remaining
            </span>

            <span>
              Rs. {remaining.toFixed(2)}
            </span>
          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* SUBMIT */}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving
            ? "Adding..."
            : "Add Room Expense"}
        </button>

      </form>

    </div>
  );
}