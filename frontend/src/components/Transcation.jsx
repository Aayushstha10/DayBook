import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiRefreshCw } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";

const Transaction = () => {
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExpenses();
  }, []);

  const getExpenses = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://daybook-j903.onrender.com/api/expenses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTransactions(res.data.expenses || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const title = item.title?.toLowerCase() || "";
      const category = item.category?.toLowerCase() || "";

      return (
        title.includes(search.toLowerCase()) ||
        category.includes(search.toLowerCase())
      );
    });
  }, [transactions, search]);

  const totalExpense = filteredTransactions.reduce(
    (sum, item) => sum + Number(item.amount),
    0,
  );

  const average =
    filteredTransactions.length > 0
      ? (totalExpense / filteredTransactions.length).toFixed(2)
      : "0.00";

  const highestExpense =
    filteredTransactions.length > 0
      ? Math.max(...filteredTransactions.map((item) => Number(item.amount)))
      : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <ToastContainer />
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">My Transactions</h1>

        <button
          onClick={getExpenses}
          className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition duration-300 shadow-md hover:rotate-180"
          title="Refresh"
        >
          <FiRefreshCw size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <input
          type="text"
          placeholder="Search by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl shadow p-5 hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Total Expense</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mt-2">
            रु {totalExpense.toFixed(2)}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5 hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Transactions</p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2">
            {filteredTransactions.length}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5 hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Average Expense</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">
            रु {average}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5 hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Highest Expense</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
            रु {highestExpense.toFixed(2)}
          </h2>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-5 border-b">
          <h2 className="text-lg sm:text-xl font-bold">Recent Transactions</h2>

          <span className="text-gray-500 text-sm">
            {filteredTransactions.length} Records
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-base sm:text-lg font-medium">
            Loading...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((item, index) => (
                  <tr
                    key={item._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">{index + 1}</td>

                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      {item.title}
                    </td>

                    <td className="px-4 py-3">
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs sm:text-sm">
                        {item.category}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-semibold text-red-600">
                      रु {Number(item.amount).toFixed(2)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transaction;
