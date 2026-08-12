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
    const searchUsers = async () => {
      if (!search.trim()) {
        setUsers([]);
        return;
      }

      try {
        setLoading(true);

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
        console.error(error);

        if (error.response?.status === 403) {
          setMessage("Only admin can search users.");
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);

    return () => clearTimeout(timer);
  }, [search, token]);

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

      setMessage(response.data.message);

      setSearch("");
      setUsers([]);

      if (onMemberAdded) {
        onMemberAdded(response.data.room);
      }
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message || "Failed to add member"
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Search username or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
      />

      {loading && (
        <p className="mt-2 text-sm text-gray-500">
          Searching...
        </p>
      )}

      {users.length > 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-lg border bg-white shadow-lg">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between border-b p-3 last:border-b-0"
            >
              <div>
                <p className="font-medium">
                  {user.username}
                </p>

                <p className="text-sm text-gray-500">
                  {user.email}
                </p>
              </div>

              <button
                onClick={() => handleAddMember(user._id)}
                disabled={adding}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}

      {search && !loading && users.length === 0 && (
        <p className="mt-2 text-sm text-gray-500">
          No users found
        </p>
      )}

      {message && (
        <p className="mt-3 text-sm text-gray-700">
          {message}
        </p>
      )}
    </div>
  );
};

export default AddMember;