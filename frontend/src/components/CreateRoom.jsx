import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://daybook-j903.onrender.com/api";

const CreateRoom = () => {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    if (!roomName.trim()) {
      setError("Please enter a room name");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login first");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        `${API}/rooms`,
        {
          name: roomName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("CREATE ROOM RESPONSE:", response.data);

      const createdRoom = response.data.room;

      if (!createdRoom?._id) {
        setError("Backend did not return room ID");
        return;
      }

      // Go to newly created room
      navigate(`/room/${createdRoom._id}`);

    } catch (error) {
      console.error(
        "CREATE ROOM ERROR:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Unable to create room"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <h2 className="mb-2 text-xl font-bold">
        Create Room
      </h2>

      <p className="mb-5 text-sm text-gray-500">
        Create multiple rooms and manage members and expenses separately.
      </p>

      <form onSubmit={handleCreateRoom}>

        <input
          type="text"
          value={roomName}
          onChange={(e) => {
            setRoomName(e.target.value);
            setError("");
          }}
          placeholder="Enter room name"
          className="mb-3 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && (
          <p className="mb-3 text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Room"}
        </button>

      </form>
    </div>
  );
};

export default CreateRoom;