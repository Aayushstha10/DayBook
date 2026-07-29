import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
  import { ToastContainer, toast } from 'react-toastify';

const AddExpense = ({ onAddExpense }) => {
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !expense.title ||
      !expense.amount ||
      !expense.category ||
      !expense.date
    ) {
      toast.error("Please fill all fields.");
      return;
    }

    const newExpense = {
      ...expense,
      amount: Number(expense.amount),
    };

    try {
        const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/expenses",
        newExpense,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log(response.data);

      onAddExpense?.(response.data);

      toast.success("Expense created successfully");

      setExpense({
        title: "",
        amount: "",
        category: "",
        date: "",
      });

      setShowForm(false);

      navigate("/dashboard");
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast("Failed to create expense");
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
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

              <input
                type="date"
                name="date"
                value={expense.date}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
              />

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
      <ToastContainer />
    </div>
  );
};

export default AddExpense;
