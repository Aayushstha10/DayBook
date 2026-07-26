import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = "http://localhost:5000/api/expenses";

export default function Transactions() {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editExpense, setEditExpense] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExpenses(res.data.expenses || []);
    } catch (err) {
      console.log(err);
    }
  };

  // Delete Expense
  const deleteExpense = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExpenses((prev) => prev.filter((item) => item._id !== id));
      setDeleteId(null);
      toast.success("Expense deleted successfully");
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete expense");
    }
  };

  // Update Expense
  const updateExpense = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(`${API}/${editExpense._id}`, editExpense, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExpenses((prev) =>
        prev.map((item) =>
          item._id === editExpense._id ? res.data.expense : item
        )
      );

      toast.success("Expense updated successfully");
      setEditExpense(null);
    } catch (err) {
      console.log(err);
      toast.error("Failed to update expense");
    }
  };

  const filtered = expenses.filter((item) => {
    return (
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">Transactions</h2>

        <input
          className="border rounded-lg px-4 py-2 w-72"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr key={item._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{item.title}</td>
                <td className="p-3">{item.category}</td>
                <td className="p-3">रु {item.amount}</td>
                <td className="p-3">
                  {new Date(item.date).toLocaleDateString()}
                </td>

                <td className="p-3 text-center space-x-2">
                  <button
                    onClick={() => setSelectedExpense(item)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    View
                  </button>

                  <button
                    onClick={() => setEditExpense(item)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => setDeleteId(item._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Expense Details</h2>

            <p>
              <strong>Title:</strong> {selectedExpense.title}
            </p>
            <p>
              <strong>Category:</strong> {selectedExpense.category}
            </p>
            <p>
              <strong>Amount:</strong> रु {selectedExpense.amount}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedExpense.date).toLocaleDateString()}
            </p>

            <button
              onClick={() => setSelectedExpense(null)}
              className="mt-5 bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editExpense && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Edit Expense</h2>

            <input
              className="border w-full p-2 mb-3 rounded"
              value={editExpense.title}
              onChange={(e) =>
                setEditExpense({
                  ...editExpense,
                  title: e.target.value,
                })
              }
            />

            <input
              type="number"
              className="border w-full p-2 mb-3 rounded"
              value={editExpense.amount}
              onChange={(e) =>
                setEditExpense({
                  ...editExpense,
                  amount: e.target.value,
                })
              }
            />

            <input
              className="border w-full p-2 mb-3 rounded"
              value={editExpense.category}
              onChange={(e) =>
                setEditExpense({
                  ...editExpense,
                  category: e.target.value,
                })
              }
            />

            <input
              type="date"
              className="border w-full p-2 mb-4 rounded"
              value={editExpense.date?.substring(0, 10)}
              onChange={(e) =>
                setEditExpense({
                  ...editExpense,
                  date: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditExpense(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={updateExpense}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-lg">
            <h2 className="text-xl font-bold text-red-600 mb-3">
              Delete Expense
            </h2>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this expense?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
              >
                No
              </button>

              <button
                onClick={() => deleteExpense(deleteId)}
                className="px-5 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}