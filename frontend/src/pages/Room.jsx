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
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const isAdmin = currentUser.role === "admin";

  // ==========================================
  // GET ROOM
  // ==========================================

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setLoading(true);
        setError("");

        // ----------------------------------
        // If already inside a room
        // ----------------------------------

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

        // ----------------------------------
        // /room
        // Find user's existing room
        // ----------------------------------

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

          // 404 means user has no room
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

  // ==========================================
  // CREATE ROOM
  // ==========================================

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

  // ==========================================
  // DELETE ROOM
  // ==========================================

  const handleDeleteRoom = async () => {
    if (!room) return;

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

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="p-6">
        Loading room...
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  // ==========================================
  // EXISTING ROOM
  // ==========================================

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

  // ==========================================
  // NO ROOM
  // ==========================================

  if (!room && !roomId) {

    // MEMBER
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

    // ADMIN
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

  // ==========================================
  // ACTUAL ROOM
  // ==========================================

  return (
    <div className="mx-auto max-w-4xl p-6">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            {room.name}
          </h1>

          <p className="text-gray-500">
            Shared Expense Room
          </p>
        </div>

        {isAdmin && (
          <div className="flex gap-2">

            <button
              onClick={handleDeleteRoom}
              className="rounded-lg bg-red-600 px-4 py-2 text-white"
            >
              Delete Room
            </button>

          </div>
        )}

      </div>

      {/* MEMBERS */}

      <div className="rounded-xl border bg-white p-6">

        <h2 className="mb-5 text-xl font-semibold">
          Members
        </h2>

        <div className="mb-3 flex justify-between rounded-lg bg-gray-50 p-4">

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

        {room.members.map((member) => (
          <div
            key={member._id}
            className="mb-3 flex justify-between rounded-lg border p-4"
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

      </div>

    </div>
  );
};

export default Room;