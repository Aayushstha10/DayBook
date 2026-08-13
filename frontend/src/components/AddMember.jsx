import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://daybook-j903.onrender.com/api";

const AddMember = ({ roomId, onMemberAdded }) => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      try {
        setLoading(true);
        setMessage("");

        const response = await axios.get(
          `${API}/rooms/users/search?search=${encodeURIComponent(search)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUsers(response.data.users || []);
      } catch (error) {
        console.error("Search error:", error);

        setMessage(
          error.response?.data?.message ||
            "Unable to search users"
        );
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchUsers, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const handleAddMember = async (userId) => {
    try {
      setAdding(true);
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

      setMessage("Member added successfully!");

      setSearch("");
      setUsers([]);

      if (onMemberAdded) {
        onMemberAdded(response.data.room);
      }
    } catch (error) {
      console.error("Add member error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to add member"
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="relative">

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search username or email..."
        className="w-72 rounded-lg border px-4 py-3 outline-none focus:ring-2"
      />

      {loading && (
        <p className="mt-2 text-sm text-gray-500">
          Searching...
        </p>
      )}

      {/* SEARCH RESULTS */}
      {users.length > 0 && (
        <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-xl border bg-white shadow-lg">

          {users.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between border-b p-4"
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
                  handleAddMember(user._id)
                }
                disabled={adding}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>

            </div>
          ))}

        </div>
      )}

      {search &&
        !loading &&
        users.length === 0 && (
          <p className="mt-2 text-sm text-gray-500">
            No users found
          </p>
        )}

      {message && (
        <p className="mt-2 text-sm text-gray-600">
          {message}
        </p>
      )}

    </div>
  );
};

export default AddMember;