import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const API = "https://daybook-j903.onrender.com/api";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [roomName, setRoomName] = useState("");

  // Add member states
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const isAdmin = currentUser.role === "admin";

  // =====================================================
  // LOAD ROOM
  // =====================================================

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setLoading(true);
        setError("");

        // -----------------------------------------------
        // Already inside room
        // -----------------------------------------------

        if (roomId) {
          const response = await axios.get(
            `${API}/rooms/${roomId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setRoom(response.data.room);

          return;
        }

        // -----------------------------------------------
        // Get current user's room
        // -----------------------------------------------

        try {
          const response = await axios.get(
            `${API}/rooms/my-room`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setRoom(response.data.room);

        } catch (error) {
          if (error.response?.status === 404) {
            setRoom(null);
          } else {
            throw error;
          }
        }

      } catch (error) {
        console.error(
          "ROOM ERROR:",
          error.response?.data || error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load room"
        );

      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [roomId, token]);

  // =====================================================
  // CREATE ROOM
  // =====================================================

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    if (!isAdmin) return;

    if (!roomName.trim()) {
      setError("Enter room name");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await axios.post(
        `${API}/rooms`,
        {
          name: roomName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newRoom = response.data.room;

      navigate(`/room/${newRoom._id}`);

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to create room"
      );

    } finally {
      setCreating(false);
    }
  };

  // =====================================================
  // SEARCH USERS
  // =====================================================

  const handleSearchUsers = async (e) => {
    const value = e.target.value;

    setSearch(value);
    setMessage("");

    if (!value.trim()) {
      setUsers([]);
      return;
    }

    if (!isAdmin) {
      return;
    }

    try {
      setSearching(true);

      const response = await axios.get(
        `${API}/rooms/users/search?search=${encodeURIComponent(
          value
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(response.data.users || []);

    } catch (error) {
      console.error(
        "SEARCH USERS ERROR:",
        error.response?.data || error
      );

      setUsers([]);

      setMessage(
        error.response?.data?.message ||
          "Unable to search users"
      );

    } finally {
      setSearching(false);
    }
  };

  // =====================================================
  // ADD MEMBER
  // =====================================================

  const handleAddMember = async (userId) => {
    if (!isAdmin || !roomId) {
      return;
    }

    try {
      setAdding(userId);
      setMessage("");

      const response = await axios.post(
        `${API}/rooms/${roomId}/members`,
        {
          userId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update room immediately
      setRoom(response.data.room);

      setSearch("");
      setUsers([]);

      setMessage("Member added successfully");

    } catch (error) {
      console.error(
        "ADD MEMBER ERROR:",
        error.response?.data || error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to add member"
      );

    } finally {
      setAdding(null);
    }
  };

  // =====================================================
  // DELETE ROOM
  // =====================================================

  const handleDeleteRoom = async () => {
    if (!room || !isAdmin) return;

    const confirmed = window.confirm(
      `Delete "${room.name}" permanently?`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API}/rooms/${room._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Room deleted successfully");

      setRoom(null);

      navigate("/room");

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Unable to delete room"
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-6">
        Loading room...
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  // =====================================================
  // EXISTING ROOM CARD
  // /room
  // =====================================================

  if (room && !roomId) {
    return (
      <div className="mx-auto max-w-2xl p-6">

        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <h1 className="text-2xl font-bold">
            {room.name}
          </h1>

          <p className="mt-2 text-gray-500">
            Your shared expense room
          </p>

          <div className="mt-6 flex gap-3">

            <button
              onClick={() =>
                navigate(`/room/${room._id}`)
              }
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              Enter Room
            </button>

            {isAdmin && (
              <button
                onClick={handleDeleteRoom}
                className="rounded-lg bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700"
              >
                Delete Room
              </button>
            )}

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // NO ROOM
  // =====================================================

  if (!room && !roomId) {

    // Normal member
    if (!isAdmin) {
      return (
        <div className="mx-auto max-w-lg p-6">

          <div className="rounded-xl border bg-white p-6 shadow-sm">

            <h1 className="text-xl font-bold">
              No Room Found
            </h1>

            <p className="mt-2 text-gray-500">
              You are not a member of any room yet.
            </p>

          </div>

        </div>
      );
    }

    // Admin
    return (
      <div className="mx-auto max-w-lg p-6">

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <h1 className="mb-2 text-2xl font-bold">
            Create Room
          </h1>

          <p className="mb-6 text-gray-500">
            Create a room for your members.
          </p>

          <form onSubmit={handleCreateRoom}>

            <input
              value={roomName}
              onChange={(e) =>
                setRoomName(e.target.value)
              }
              placeholder="Room name"
              className="mb-4 w-full rounded-lg border px-4 py-3"
            />

            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white"
            >
              {creating
                ? "Creating..."
                : "Create Room"}
            </button>

          </form>

        </div>

      </div>
    );
  }

  // =====================================================
  // ACTUAL ROOM
  // =====================================================

  return (
    <div className="mx-auto max-w-4xl p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            {room.name}
          </h1>

          <p className="text-gray-500">
            Shared Expense Room
          </p>
        </div>

        {/* ADMIN ONLY */}

        {isAdmin && (
          <button
            onClick={handleDeleteRoom}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Delete Room
          </button>
        )}

      </div>

      {/* =================================================
          ADD MEMBER - ADMIN ONLY
      ================================================= */}

      {isAdmin && (
        <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="mb-4 text-xl font-semibold">
            Add Member
          </h2>

          <p className="mb-4 text-sm text-gray-500">
            Search for an existing user and add them
            to this room.
          </p>

          <input
            type="text"
            value={search}
            onChange={handleSearchUsers}
            placeholder="Search username or email..."
            className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* SEARCHING */}

          {searching && (
            <p className="mt-3 text-sm text-gray-500">
              Searching...
            </p>
          )}

          {/* USERS */}

          {users.length > 0 && (
            <div className="mt-3 overflow-hidden rounded-lg border">

              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between border-b p-4 last:border-b-0"
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
                    disabled={adding === user._id}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {adding === user._id
                      ? "Adding..."
                      : "Add"}
                  </button>

                </div>
              ))}

            </div>
          )}

          {/* NO USERS */}

          {search &&
            !searching &&
            users.length === 0 && (
              <p className="mt-3 text-sm text-gray-500">
                No users found.
              </p>
            )}

          {/* MESSAGE */}

          {message && (
            <p className="mt-3 text-sm text-green-600">
              {message}
            </p>
          )}

        </div>
      )}

      {/* =================================================
          MEMBERS
      ================================================= */}

      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="mb-5 text-xl font-semibold">
          Members ({(room.members?.length || 0) + 1})
        </h2>

        {/* ADMIN */}

        <div className="mb-3 flex items-center justify-between rounded-lg bg-gray-50 p-4">

          <div>
            <p className="font-semibold">
              {room.admin?.username}
            </p>

            <p className="text-sm text-gray-500">
              {room.admin?.email}
            </p>
          </div>

          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
            Admin
          </span>

        </div>

        {/* MEMBERS */}

        {room.members?.map((member) => (
          <div
            key={member._id}
            className="mb-3 flex items-center justify-between rounded-lg border p-4"
          >

            <div>
              <p className="font-semibold">
                {member.username}
              </p>

              <p className="text-sm text-gray-500">
                {member.email}
              </p>
            </div>

            <span className="text-sm text-gray-500">
              Member
            </span>

          </div>
        ))}

        {/* NO MEMBERS */}

        {(!room.members ||
          room.members.length === 0) && (
          <p className="py-5 text-center text-gray-500">
            No members yet.
          </p>
        )}

      </div>

    </div>
  );
};

export default Room;