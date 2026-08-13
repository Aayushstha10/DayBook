import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://daybook-j903.onrender.com/api";

// Small helper to render initials for avatar circles
const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

// Simple deterministic color per person, based on id
const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-teal-500",
];

const getAvatarColor = (id = "") => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const AddMember = ({ roomId, onMemberAdded }) => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(null);
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
          error.response?.data?.message || "Unable to search users"
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
      setAdding(userId);
      setMessage("");

    const response = await axios.post(
        `${API}/rooms/${roomId}/members`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRoom(response.data.room);
      setSearch("");
      setUsers([]);
      setMessage(
        `${response.data.addedMember.username} (${response.data.addedMember.email}) added successfully`
      );

      setMessage("Member added successfully!");

      setSearch("");
      setUsers([]);

      if (onMemberAdded) {
        onMemberAdded(response.data.room);
      }
    } catch (error) {
      console.error("Add member error:", error);

      setMessage(error.response?.data?.message || "Unable to add member");
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="relative w-full sm:w-72">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search username or email..."
        className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 sm:text-base"
      />

      {loading && (
        <p className="mt-2 text-sm text-gray-500">Searching...</p>
      )}

      {/* SEARCH RESULTS */}
      {users.length > 0 && (
        <div className="absolute left-0 right-0 top-14 z-50 max-h-80 overflow-y-auto rounded-xl border bg-white shadow-lg sm:left-auto sm:right-0 sm:w-80">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between gap-3 border-b p-3 last:border-b-0 sm:p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${getAvatarColor(
                    user._id
                  )}`}
                >
                  {getInitials(user.username)}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">
                    {user.username}
                  </p>

                  <p className="truncate text-sm text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleAddMember(user._id)}
                disabled={adding === user._id}
                className="shrink-0 rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {adding === user._id ? "Adding..." : "Add"}
              </button>
            </div>
          ))}
        </div>
      )}

      {search && !loading && users.length === 0 && (
        <p className="mt-2 text-sm text-gray-500">No users found</p>
      )}

      {message && (
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default AddMember;