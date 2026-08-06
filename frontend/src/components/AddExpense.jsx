import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AddExpense = ({ onAddExpense }) => {
  const navigate = useNavigate();
  const dateRef = useRef(null);

  const [showForm, setShowForm] = useState(false);
  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showForm]);

  const [expense, setExpense] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  });

  const handleChange = (e) => {
    setExpense({
      ...expense,
      [e.target.name]: e.target.value,
    });
  };

  const openDatePicker = () => {
    if (dateRef.current?.showPicker) {
      dateRef.current.showPicker();
    } else {
      dateRef.current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!expense.title) {
      toast.error("enter valid title");
    }
    if (!expense.date) {
      toast.error("enter valid date");
    }
    if (!expense.amount || !expense.category) {
      toast.error("Please fill all fields.");
      return;
    }

    const newExpense = {
      ...expense,
      amount: Number(expense.amount),
    };

    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        "https://daybook-j903.onrender.com/api/expenses",
        newExpense,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      onAddExpense?.(response.data);

      setExpense({
        title: "",
        amount: "",
        category: "",
        date: "",
      });

      setShowForm(false);

      toast.success("Expense created successfully", {
        autoClose: 1000,
        onClose: () => navigate("/dashboard"),
      });
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error("Failed to create expense");
    }
  };

  return (
    <div>
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-moss-light hover:bg-moss text-white px-6 py-3 rounded-xl"
        >
          + Add Expense
        </button>
      )}

      {showForm && (
        <div className="fixed inset-0 overflow-hidden flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Add Expense</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Expense Title"
                value={expense.title}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
                minLength={2}
                maxLength={50}
                pattern="[A-Za-z]+"
                title="Title can only contain letters"
              />

              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={expense.amount}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
              />

              <select
                name="category"
                value={expense.category}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="">Select Category</option>
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Shopping">Shopping</option>
                <option value="Bills">Bills</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Others">Others</option>
              </select>

              <div className="relative w-full" onClick={openDatePicker}>
                <input
                  ref={dateRef}
                  type="date"
                  name="date"
                  value={expense.date}
                  onChange={handleChange}
                  className="w-full p-2 pr-10 border rounded bg-white appearance-none"
                  style={{ colorScheme: "light" }}
                  max={
                    new Date(
                      Date.now() - new Date().getTimezoneOffset() * 60000,
                    )
                      .toISOString()
                      .split("T")[0]
                  }
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2 bg-gray-500 text-white rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddExpense;
