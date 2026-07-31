import React, { useEffect, useState } from "react";
import axios from "axios";

const Room = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://daybook-j903.onrender.com/api/getallexpenses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExpenses(res.data.expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">
          Room Expenses
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">No expenses found.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {expenses.map((expense) => (
              <div
                key={expense._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition duration-300 p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {expense.category}
                  </span>

                  <span className="text-green-600 text-xl font-bold">
                    Rs. {expense.amount}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {expense.title}
                </h2>

                <div className="space-y-2 text-gray-600">
                  <p>
                    <span className="font-semibold">User:</span>{" "}
                    {expense.user?.username || "Unknown"}
                  </p>

                  <p>
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;