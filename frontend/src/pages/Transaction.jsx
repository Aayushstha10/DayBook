import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, Pencil, Trash2, X } from "lucide-react";

const API = "https://daybook-j903.onrender.com/api/expenses";

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
          item._id === editExpense._id ? res.data.expense : item,
        ),
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

  const IconBtn = ({ onClick, color, label, children }) => (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`p-2 rounded-lg text-white ${color} transition-colors`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
        <h2 className="text-xl sm:text-2xl font-bold">Transactions</h2>

        <input
          className="border rounded-lg px-4 py-2 w-full sm:w-72"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-200">
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

                <td className="p-3">
                  <div className="flex justify-center gap-2">
                    <IconBtn
                      onClick={() => setSelectedExpense(item)}
                      color="bg-blue-500 hover:bg-blue-600"
                      label="View"
                    >
                      <Eye size={16} />
                    </IconBtn>

                    <IconBtn
                      onClick={() => setEditExpense(item)}
                      color="bg-green-500 hover:bg-green-600"
                      label="Edit"
                    >
                      <Pencil size={16} />
                    </IconBtn>

                    <IconBtn
                      onClick={() => setDeleteId(item._id)}
                      color="bg-red-500 hover:bg-red-600"
                      label="Delete"
                    >
                      <Trash2 size={16} />
                    </IconBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map((item) => (
          <div
            key={item._id}
            className="border rounded-lg p-4 flex flex-col gap-1 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-gray-500">{item.category}</p>
              </div>
              <div className="flex gap-2">
                <IconBtn
                  onClick={() => setSelectedExpense(item)}
                  color="bg-blue-500 hover:bg-blue-600"
                  label="View"
                >
                  <Eye size={16} />
                </IconBtn>

                <IconBtn
                  onClick={() => setEditExpense(item)}
                  color="bg-green-500 hover:bg-green-600"
                  label="Edit"
                >
                  <Pencil size={16} />
                </IconBtn>

                <IconBtn
                  onClick={() => setDeleteId(item._id)}
                  color="bg-red-500 hover:bg-red-600"
                  label="Delete"
                >
                  <Trash2 size={16} />
                </IconBtn>
              </div>
            </div>

            <div className="flex justify-between text-sm mt-2">
              <span>रु {item.amount}</span>
              <span className="text-gray-500">
                {new Date(item.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            No transactions found
          </p>
        )}
      </div>

      {selectedExpense && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm relative">
            <button
              onClick={() => setSelectedExpense(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              aria-label="Close"
            >
              <X size={20} />
            </button>

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
              className="mt-5 w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {editExpense && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm relative">
            <button
              onClick={() => setEditExpense(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              aria-label="Close"
            >
              <X size={20} />
            </button>

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

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
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

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-xs shadow-lg">
            <h2 className="text-xl font-bold text-red-600 mb-3">
              Delete Expense
            </h2>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this expense?
            </p>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
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
